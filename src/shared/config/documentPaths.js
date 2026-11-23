/*
 * Uploaded document locations, in one place.
 *
 * Base URLs come from .env:
 *   VITE_HRMS_DOC_BASE_URL   legacy HRMS server (documents uploaded before SDL Hub)
 *   VITE_DOWNLOAD_URL        server serving the backend's input/ folders (gate pass files)
 *   VITE_DOCUMENT_VIEWER_URL optional; defaults to the backend common/view_document.php
 *
 * DOC_FOLDERS mirror sdlhub-backend api/config/path.php. They are the prefixes the
 * DOC_PATH columns store, so change them there and here together.
 */

const trimEnd = value => String(value || '').trim().replace(/\/+$/, '')
const cleanPath = path => String(path || '').trim().replace(/^\/+/, '')
const join = (base, path) => (base ? `${base}/${cleanPath(path)}` : cleanPath(path))

export const LEGACY_DOC_BASE_URL = trimEnd(import.meta.env.VITE_HRMS_DOC_BASE_URL)
export const DOWNLOAD_BASE_URL = trimEnd(import.meta.env.VITE_DOWNLOAD_URL)
export const DOCUMENT_VIEWER_URL =
  trimEnd(import.meta.env.VITE_DOCUMENT_VIEWER_URL) ||
  `${trimEnd(import.meta.env.VITE_BASE_URL)}/common/view_document.php`

export const DOC_FOLDERS = Object.freeze({
  // Backend input/ folders (legacy hradmin layout)
  EMP_DOCS: 'input/emp_docs',
  JD_DOCS: 'input/jd_docs',
  POLICY_DOCS: 'input/policy_doc',
  GATEPASS: 'input/gatepass',
  // Candidate files: legacy careers folder, and the SDL Hub careers uploads prefix
  CAREERS: 'careers',
  CAREERS_UPLOADS: 'sdlhub',
  // Profile change request uploads (DOCUMENT_ROOT, served by view_document.php)
  BANK_DOCS: 'uploads/bank_document',
  MEMBER_DOCS: 'uploads/member_document',
  ADDRESS_PROOF: 'uploads/address_proof'
})

/** Whether a DOC_PATH sits in one of DOC_FOLDERS. */
export const isInDocFolder = (path, folder) => cleanPath(path).startsWith(`${folder}/`)

/** A document on the legacy HRMS server. */
export const legacyDocUrl = path => (path ? join(LEGACY_DOC_BASE_URL, path) : '')

/** A file under the backend's download base (input/... folders). */
export const downloadUrl = path => (path ? join(DOWNLOAD_BASE_URL, path) : '')

/** A file under DOCUMENT_ROOT, streamed by the backend document viewer. */
export const documentViewerUrl = path =>
  path ? `${DOCUMENT_VIEWER_URL}?file=${encodeURIComponent(cleanPath(path))}` : ''

/**
 * A policy document (HR_POLICY.DOC_PATH). The backend serves it from this server,
 * or redirects to the legacy HRMS server for policies uploaded before SDL Hub.
 */
export const policyDocUrl = path =>
  path
    ? `${trimEnd(import.meta.env.VITE_API_URL)}/common/viewPolicyDocument.php?path=${encodeURIComponent(cleanPath(path))}`
    : ''
