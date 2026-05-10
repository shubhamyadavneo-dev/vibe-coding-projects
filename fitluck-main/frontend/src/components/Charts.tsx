import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#78716c' } },
    y: { grid: { color: '#e7e5e4' }, ticks: { color: '#78716c' } },
  },
}

export function WeightChart({ labels, values }: { labels: string[]; values: number[] }) {
  return (
    <Line
      options={baseOptions}
      data={{
        labels,
        datasets: [
          {
            data: values,
            borderColor: '#65a30d',
            backgroundColor: 'rgba(132, 204, 22, 0.18)',
            fill: true,
            tension: 0.35,
          },
        ],
      }}
    />
  )
}

export function VolumeChart({ labels, values }: { labels: string[]; values: number[] }) {
  return (
    <Bar
      options={baseOptions}
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: '#1c1917',
            borderRadius: 8,
          },
        ],
      }}
    />
  )
}

export function CompletionChart({ value }: { value: number }) {
  const remaining = Math.max(0, 100 - value)
  return (
    <Doughnut
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false } },
      }}
      data={{
        labels: ['Complete', 'Remaining'],
        datasets: [
          {
            data: [value, remaining],
            backgroundColor: ['#65a30d', '#e7e5e4'],
            borderWidth: 0,
          },
        ],
      }}
    />
  )
}
