import React, { ReactNode } from "react";

import { CustomErrorBoundary } from "../CustomErrorBoundary";
import { AuthLayout } from "./AuthLayout";
import { PageLayout } from "./PageLayout";
import { Alerts } from "@/components";

export enum LayoutTypes {
  AUTH = "AUTH",
  PAGE = "PAGE",
}

type LayoutType = LayoutTypes.AUTH | LayoutTypes.PAGE;
type LayoutProps = {
  type?: LayoutType;
  title: string;
  children: ReactNode;
};

export const Layout = ({ type, title, children }: LayoutProps) => {
  let layout;
  switch (type) {
    case LayoutTypes.AUTH:
      layout = <AuthLayout title={title}>{children}</AuthLayout>;
      break;
    case LayoutTypes.PAGE:
    default:
      layout = <PageLayout title={title}>{children}</PageLayout>;
  }
  return (
    <CustomErrorBoundary
      fallback={<h2>Oops! Something went wrong in this section.</h2>}
    >
      <Alerts />
      {layout}
    </CustomErrorBoundary>
  );
};
