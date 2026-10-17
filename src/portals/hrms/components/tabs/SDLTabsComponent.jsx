import { useEffect, useRef, useState } from 'react'

const SDLTabsComponent = ({
  tabs = [],
  selectedTab,
  onTabChange,
  tabContent,
  children,
  loading = false
}) => {
  const tabsContainerRef = useRef(null)
  const tabRefs = useRef({})

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = () => {
    const container = tabsContainerRef.current

    if (!container) return

    const hasOverflow =
      container.scrollWidth > container.clientWidth

    setCanScrollLeft(container.scrollLeft > 0)

    setCanScrollRight(
      hasOverflow &&
      container.scrollLeft + container.clientWidth <
        container.scrollWidth - 1
    )
  }

  useEffect(() => {
    updateScrollButtons()

    const container = tabsContainerRef.current

    if (!container) return

    const handleResize = () => {
      updateScrollButtons()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [tabs])

  useEffect(() => {
    const activeTab = tabRefs.current[selectedTab]

    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }

    setTimeout(() => {
      updateScrollButtons()
    }, 300)
  }, [selectedTab])

  const scrollTabs = direction => {
    const container = tabsContainerRef.current

    if (!container) return

    const scrollAmount = 250

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })

    setTimeout(() => {
      updateScrollButtons()
    }, 300)
  }

  if (loading) {
    return (
      <div className='text-center py-4'>
        <span className='spinner-border' role='status' />
      </div>
    )
  }

  if (!tabs.length) {
    return <div className='text-muted'>No tabs available.</div>
  }

  return (
    <>
      <div className='sdl-tabs-wrapper'>

        {canScrollLeft && (
          <button
            type='button'
            className='sdl-tabs-arrow sdl-tabs-arrow-left'
            onClick={() => scrollTabs('left')}
            aria-label='Scroll tabs left'
          >
            ‹
          </button>
        )}

        <div
          className='sdl-tabs-container'
          ref={tabsContainerRef}
          onScroll={updateScrollButtons}
        >
          <ul className='nav sdl-tabs' role='tablist'>
            {tabs.map(tab => {
              const isActive = selectedTab === tab.key
              const isDisabled = tab.disabled

              return (
                <li
                  className='nav-item'
                  key={tab.key}
                  role='presentation'
                  ref={element => {
                    tabRefs.current[tab.key] = element
                  }}
                >
                  <button
                    type='button'
                    className={`nav-link ${
                      isActive ? 'active' : ''
                    } ${isDisabled ? 'disabled' : ''}`}
                    role='tab'
                    aria-selected={isActive}
                    aria-disabled={isDisabled}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        onTabChange?.(tab.key)
                      }
                    }}
                  >
                    {tab.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {canScrollRight && (
          <button
            type='button'
            className='sdl-tabs-arrow sdl-tabs-arrow-right'
            onClick={() => scrollTabs('right')}
            aria-label='Scroll tabs right'
          >
            ›
          </button>
        )}

      </div>

      <div className='tab-content sdl-tab-content'>
        <div
          className='tab-pane show active text-dark'
          tabIndex='0'
          role='tabpanel'
        >
          {tabContent ?? children}
        </div>
      </div>
    </>
  )
}

export default SDLTabsComponent