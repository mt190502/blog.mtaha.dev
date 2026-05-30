import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { plugins } from "./.quartz/plugins"

plugins["explorer"].Explorer({
  filterFn: (node: { displayName?: string; slugSegment?: string; slugSegments?: string[]; data?: Record<string, unknown> | null }) => {
    if (node.displayName === "hidden") return false
    if ((node.data?.tags as string[] | undefined)?.includes("hidden")) return false
    if (node.slugSegment === "tags" || node.slugSegments?.[0] === "tags") return false
    return true
  },
})

plugins["recent-notes"].RecentNotes({
  filter: (f: { frontmatter?: { tags?: string[] } }) => {
    return !(f.frontmatter?.tags && ["home", "hidden"].some((tag) => f.frontmatter?.tags?.includes(tag)))
  },
  sort: (f1: { dates?: { created?: string } }, f2: { dates?: { created?: string } }) => {
    const date1 = f1.dates?.created ? new Date(f1.dates.created).getTime() : 0
    const date2 = f2.dates?.created ? new Date(f2.dates.created).getTime() : 0
    return date2 - date1
  },
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
