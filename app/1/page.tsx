"use client";

import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";
import Test from "@/components/Test";
import React from "react";

const page = () => {
  const pathname = usePathname();
  // const printerId = pathname.split("/").pop();
  const printerId = "73190897";
  const collection = "ΑΛΙΜΟΣ";
  return <Test printerId={printerId} collectionName={collection} />;
};

export default page;
