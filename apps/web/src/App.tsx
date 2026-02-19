import { createBrowserRouter } from "react-router";
import { Layout } from "@/components/layout";
import { HomePage } from "@/pages/home";
import { NewsPage } from "@/pages/news";
import { ArticlePage } from "@/pages/article";
import { CommunityVoicesPage } from "@/pages/community-voices";
// import { WriteForUllatchiPage } from "@/pages/write-for-ullatchi"
import { ReportIssuePage } from "@/pages/report-issue";
import { GovernmentWatchPage } from "@/pages/government-watch";
import { AboutPage } from "@/pages/about";
import { ContactPage } from "@/pages/contact";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/news",
        element: <NewsPage />,
      },
      {
        path: "/article/:slug",
        element: <ArticlePage />,
      },
      {
        path: "/community-voices",
        element: <CommunityVoicesPage />,
      },
      // TODO: Add write for ullatchi page after user authentication is implemented
      // {
      //   path: "/write-for-ullatchi",
      //   element: <WriteForUllatchiPage />,
      // },
      {
        path: "/report-issue",
        element: <ReportIssuePage />,
      },
      {
        path: "/government-watch",
        element: <GovernmentWatchPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
    ],
  },
]);
