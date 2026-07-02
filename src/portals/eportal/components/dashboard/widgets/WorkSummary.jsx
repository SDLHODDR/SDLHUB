import Chart from "react-apexcharts";

const WorkSummary = ({ data }) => {
  if (!data) return null;

  const summary = data.summary || [];
  const duration = data.duration || "";
  const avgWorkHrs = data.avgWorkHrs || "0";

  const labels = summary.map((item) => item.category);
  const series = summary.map((item) => Number(item.value));

  const total = series.reduce((a, b) => a + b, 0);

  const work = Number(
    summary.find((item) => item.category === "Work")?.value || 0
  );

  const workPercent =
    total > 0 ? ((work / total) * 100).toFixed(1) : "0";

  const options = {
    chart: {
      type: "donut",
      toolbar: {
        show: false,
      },
    },

    labels,

    colors: [
      "#28C76F",
      "#FF9F43",
      "#EA5455",
      "#7367F0",
    ],

    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      itemMargin: {
        horizontal: 12,
        vertical: 6,
      },
      formatter: function (seriesName, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];
        return `${seriesName}: ${value}`;
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      width: 4,
      colors: ["#fff"],
    },

    plotOptions: {
      pie: {
        donut: {
          size: "72%",

          labels: {
            show: true,

            name: {
              show: true,
              offsetY: 18,
              fontSize: "15px",
            },

            value: {
              show: true,
              offsetY: -18,
              fontSize: "30px",
              fontWeight: 700,
              formatter: () => `${workPercent}%`,
            },

            total: {
              show: true,
              label: "Work",
              formatter: () => `${workPercent}%`,
            },
          },
        },
      },
    },

    tooltip: {
      y: {
        formatter: (val) => `${val} Days`,
      },
    },

    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          Working Day's Summary
        </h5>

        <small className="text-muted">
          {duration}
        </small>
      </div>

      {/* Body */}
      <div className="card-body">
        <Chart
          options={options}
          series={series}
          type="donut"
          height={330}
        />

        {/* Footer */}
        <div className="d-flex justify-content-end mt-3">
          <small className="text-muted">
            Avg working hrs:&nbsp;
            <strong>{avgWorkHrs} Hrs</strong>
          </small>
        </div>
      </div>
    </div>
  );
};

export default WorkSummary;