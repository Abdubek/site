import fetch from "node-fetch"
import {
  TreeMap,
  TreeMapDefaultProps,
} from "@nivo/treemap"

const api = "https://pomber.github.io/covid19/"
const DATA = api + "timeseries.json"
const FLAGS = api + "countries.json"

export async function getStaticProps() {
  const [data, flags] = await Promise.all([
    fetch(DATA).then(r => r.json()),
    fetch(FLAGS).then(r => r.json()),
  ])
  const { lastDate, rows } = transform(data, flags)
  return {
    props: { lastDate, rows },
  }
}

export default function HomePage({
  lastDate,
  rows,
}) {
  return (
    <>
      <h2>Coronavirus {lastDate}</h2>
      <Chart rows={rows} />
    </>
  )
}

function Chart({ rows }) {
  return (
    <TreeMap
      root={{ children: rows }}
      identity="country"
      value="deaths"
      width={402}
      height={192}
      innerPadding={1}
    />
  )
}

function transform(data, flags) {
  const countries = Object.keys(data)
  const firstCountry = data[countries[0]]
  const lastDate =
    firstCountry[firstCountry.length - 1].date
  const rows = countries
    .map(country => {
      const lastDay = data[country].find(
        x => x.date === lastDate
      )
      return {
        country,
        confirmed: lastDay.confirmed,
        deaths: lastDay.deaths,
        flag: flags[country]?.flag || "❓",
      }
    })
    .filter(r => r.deaths > 8)
  return { lastDate, rows }
}
