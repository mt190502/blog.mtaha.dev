import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzPluginData } from "./quartz/plugins/vfile"
import { FileTrieNode } from "./quartz/util/fileTrie"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {},
  }),
  // footer: Component.Footer({
  // links: {
  // GitHub: "https://github.com/jackyzha0/quartz",
  // "Discord Community": "https://discord.gg/cRFFHYye7t",
  // },
  // }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      filterFn: (f: FileTrieNode) => {
        return f.displayName !== "hidden" && f.data?.tags?.includes("hidden") === false
      },
    }),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent Notes",
        limit: 3,
        showTags: false,
        filter: (f: QuartzPluginData) => {
          return !(
            f.frontmatter?.tags &&
            ["home", "hidden"].some((tag) => f.frontmatter?.tags?.includes(tag))
          )
        },
        sort: (f1, f2) => {
          const date1 = f1.dates?.created ? new Date(f1.dates.created).getTime() : 0
          const date2 = f2.dates?.created ? new Date(f2.dates.created).getTime() : 0
          return date2 - date1
        },
      }),
    ),
  ],
  right: [
    Component.Graph({
      localGraph: {
        drag: true,
        zoom: true,
        depth: 3,
        scale: 1.1,
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: ["hidden"],
        showTags: true,
      },
      globalGraph: {
        drag: true,
        zoom: true,
        depth: -1,
        scale: 0.9,
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: ["hidden"],
        showTags: true,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    // Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.DesktopOnly(
      Component.Explorer({
        filterFn: (f: FileTrieNode) => {
          return f.displayName !== "hidden" && f.data?.tags?.includes("hidden") === false
        },
      }),
    ),
  ],
  right: [],
}
