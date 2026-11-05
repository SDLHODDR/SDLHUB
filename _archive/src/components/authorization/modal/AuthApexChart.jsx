import ReactApexChart from "react-apexcharts";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const AuthApexCharts = ({
  dataSource = [],
  loading = false
}) => {

  /* ========================================= */
  /* LOADING */
  /* ========================================= */

  if (loading) {
    return (
      <div className="text-center py-4">
        Loading analytics...
      </div>
    );
  }

  /* ========================================= */
  /* EMPTY */
  /* ========================================= */

  if (!loading && dataSource.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No Analytics Found
      </div>
    );
  }

  /* ========================================= */
  /* DONUT DATA */
  /* ========================================= */

  const leaveTypeCounts = {};

  dataSource.forEach((item) => {

    const code = item.LVE_CODE;

    leaveTypeCounts[code] =
      (leaveTypeCounts[code] || 0) + 1;

  });

  const donutLabels =
    Object.keys(leaveTypeCounts);

  const donutSeries =
    Object.values(leaveTypeCounts);

  /* ========================================= */
  /* MONTHS */
  /* ========================================= */

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  /* ========================================= */
  /* BAR CHART DATA */
  /* ========================================= */

  const leaveCodes = [
    ...new Set(
      dataSource.map((item) => item.LVE_CODE)
    )
  ];

  const series = leaveCodes.map((code) => {

    const monthlyData = new Array(12).fill(0);

    dataSource.forEach((item) => {

      if (item.LVE_CODE === code) {

        const monthIndex =
          new Date(item.LVE_DATE_FR)
            .getMonth();

        monthlyData[monthIndex] += 1;
      }

    });

    return {
      name: code,
      data: monthlyData
    };
  });

  /* ========================================= */
  /* BAR OPTIONS */
  /* ========================================= */

  const barOptions = {

    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: false
      }
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 4
      }
    },

    dataLabels: {
      enabled: false
    },

    stroke: {
      width: 1
    },

    xaxis: {
      categories: months,

      labels: {
        style: {
          fontSize: "10px"
        }
      }
    },

    yaxis: {
      labels: {
        style: {
          fontSize: "10px"
        }
      }
    },

    legend: {
      position: "bottom",
      fontSize: "11px"
    }
  };

  /* ========================================= */
  /* DONUT OPTIONS */
  /* ========================================= */

  const donutOptions = {

    chart: {
      type: "donut",
      toolbar: {
        show: false
      }
    },

    labels: donutLabels,

    dataLabels: {
      enabled: false
    },

    legend: {
      position: "bottom",
      fontSize: "11px"
    }
  };

  return (
    <>
      {/* ========================================= */}
      {/* SWIPER CSS */}
      {/* ========================================= */}

      <style>
        {`
        .auth-chart-swiper .swiper-button-next,
        .auth-chart-swiper .swiper-button-prev {
          color: #000 !important;
          width: 32px !important;
          height: 32px !important;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .auth-chart-swiper .swiper-button-next:after,
        .auth-chart-swiper .swiper-button-prev:after {
          font-size: 14px !important;
          font-weight: 700;
        }

        .auth-chart-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
        }
        `}
      </style>

      {/* ========================================= */}
      {/* SWIPER */}
      {/* ========================================= */}

      <div className="py-2 auth-chart-swiper">

        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          slidesPerView={1}
          spaceBetween={12}
          observer={true}
          observeParents={true}
          style={{
            paddingBottom: "30px",
            paddingLeft: "35px",
            paddingRight: "35px"
          }}
        >

          {/* ========================================= */}
          {/* BAR CHART */}
          {/* ========================================= */}

          <SwiperSlide>

            <div
              className="card border-0 shadow-sm mx-auto"
              style={{
                maxWidth: "650px",
                borderRadius: "12px"
              }}
            >

              <div className="card-body p-2">

                <div
                  className="fw-semibold mb-1"
                  style={{ fontSize: "14px" }}
                >
                  Monthly Leave Trends
                </div>

                <ReactApexChart
                  options={barOptions}
                  series={series}
                  type="bar"
                  height={240}
                />

              </div>

            </div>

          </SwiperSlide>

          {/* ========================================= */}
          {/* DONUT */}
          {/* ========================================= */}

          <SwiperSlide>

            <div
              className="card border-0 shadow-sm mx-auto"
              style={{
                maxWidth: "500px",
                borderRadius: "12px"
              }}
            >

              <div className="card-body p-2">

                <div
                  className="fw-semibold mb-1"
                  style={{ fontSize: "14px" }}
                >
                  Leave Distribution
                </div>

                <ReactApexChart
                  options={donutOptions}
                  series={donutSeries}
                  type="donut"
                  height={240}
                />

              </div>

            </div>

          </SwiperSlide>

        </Swiper>

      </div>
    </>
  );
};

export default AuthApexCharts;