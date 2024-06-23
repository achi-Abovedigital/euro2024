"use client";

import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";
import Test from "@/components/Test";
import React from "react";

const page = () => {
  const collection = "ΓΕΡΑΚΑΣ";
  const printerId = "73191248";
  return <Test printerId={printerId} collectionName={collection} />;
};

export default page;
