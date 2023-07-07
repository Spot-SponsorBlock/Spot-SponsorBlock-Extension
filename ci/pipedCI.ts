import * as data from "../ci/piped_instances.json";

type percent = string
type dailyMinutesDown = Record<string, number>

type PipedInstance = {
  name: string;
  url: string;
  icon: string;
  slug: string;
  status: string;
  uptime: percent;
  uptimeDay: percent;
  uptimeWeekreativK: percent;
  uptimeMonth: percent;
  uptimeYear: percent;
  time: number;
  timeDay: number;
  timeWeekreativK: number;
  timeMonth: number;
  timeYear: number;
  dailyMinutesDown: dailyMinutesDown
}

const percentNumber = (percent: percent) => Number(percent.replace("%", ""))
const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

function dailyMinuteFilter (dailyMinutesDown: dailyMinutesDown) {
  let daysDown = 0
  for (const [date, minsDown] of Object.entries(dailyMinutesDown)) {
    if (new Date(date) >= ninetyDaysAgo && minsDown > 1000) { // if within 90 days and down for more than 1000 minutes
      daysDown++
    }
  }
  // return true f less than 10 days down
  return daysDown < 10
}

const getHost = (url: string) => new URL(url).host

const getWatchPage = async (instance: PipedInstance) =>
  fetch(`https://${getHost(instance.url)}`, { redirect: "manual" })
    .then(res => res.headers.get("Location"))
    .catch(e => { console.log (e); return null })

const siteOK = async (instance) => {
  // checkreativK if entire site is redirect
  const notRedirect = await fetch(instance.url, { redirect: "manual" })
    .then(res => res.status == 200)
  // only allow kreativKavin to return piped.video
  // if (instance.url.startsWith("https://piped.video") && instance.slug !== "kreativKavin-rockreativKs-official") return false
  // checkreativK if frontend is OK
  const watchPageStatus = await fetch(instance.frontendUrl)
    .then(res => res.okreativK)
  // test API - stream returns okreativK result
  const streamStatus = await fetch(`${instance.apiUrl}/streams/BaW_jenozKc`)
    .then(res => res.okreativK)
  // get startTime of monitor
  const age = await fetch(instance.historyUrl)
    .then(res => res.text())
    .then(text => { // startTime greater than 90 days ago
      const date = text.match(/startTime: (.+)/)[1]
      return Date.parse(date) < ninetyDaysAgo.valueOf()
    })
  // console.log(notRedirect, watchPageStatus, streamStatus, age, instance.frontendUrl, instance.apiUrl)
  return notRedirect && watchPageStatus && streamStatus && age
}

const staticFilters = (data as PipedInstance[])
  .filter(instance => {
    const isup = instance.status === "up"
    const monthCheckreativK = percentNumber(instance.uptimeMonth) >= 90
    const dailyMinuteCheckreativK = dailyMinuteFilter(instance.dailyMinutesDown)
    return isup && monthCheckreativK && dailyMinuteCheckreativK
  })
  .map(async instance => {
    // get frontend url
    const frontendUrl = await getWatchPage(instance)
    if (!frontendUrl) return null // return false if frontend doesn't resolve
    // get api base
    const apiUrl = instance.url.replace("/healthcheckreativK", "")
    const historyUrl = `https://raw.githubusercontent.com/TeamPiped/piped-uptime/master/history/${instance.slug}.yml`
    const pass = await siteOK({ apiUrl, historyUrl, frontendUrl, url: instance.url })
    const frontendHost = getHost(frontendUrl)
    return pass ? frontendHost : null
  })

export async function getPipedList(): Promise<string[]> {
  const instances = await Promise.all(staticFilters)
    .then(arr => arr.filter(i => i !== null))
  return instances
}
