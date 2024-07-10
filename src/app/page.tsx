"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import UploadFile from "./dashboard/_components/upload-file";
import { Filecard } from "./dashboard/_components/file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";
export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId: any = null;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  const isLoading = files === undefined;

  return (
    <>
      <main className="container max-auto pt-12">
        {/* Team:{file.name} - Id: {file._id} */}

        {isLoading && (
          <div className="flex justify-center items-center mt-20">
            <div
              className="spinner-border text-primary flex flex-col justify-center items-center"
              role="status"
            >
              <Loader2 className="h-40 w-40 animate-spin text-indigo-500 mb-7" />
              <span className="text-2xl">Loading...</span>
            </div>
          </div>
        )}

        {files && files.length === 0 && (
          <div className="flex  gap-4 item-center justify-center mt-20">
            <div className="flex flex-col gap-5">
              <Image height={450} width={450} alt="image" src="/empty.svg" />
              <span className="text-2xl">
                You have no file yet, upload one now.
              </span>
              <UploadFile />
            </div>
          </div>
        )}

        {files && files.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                The uploader
              </h1>

              <UploadFile />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {files?.map((file, indx) => <Filecard key={indx} file={file} />)}
            </div>
          </>
        )}
      </main>
    </>
  );
}
