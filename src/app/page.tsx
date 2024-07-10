"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import UploadFile from "./dashboard/_components/upload-file";
import { Filecard } from "./dashboard/_components/file-card";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId: any = null;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  return (
    <>
      <main className="container max-auto pt-12">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            The easiest way to upload
          </h1>

          <UploadFile />
        </div>
        {/* Team:{file.name} - Id: {file._id} */}
        <div className="grid grid-cols-4 gap-4">
          {files?.map((file, indx) => <Filecard key={indx} file={file} />)}
        </div>
      </main>
    </>
  );
}
