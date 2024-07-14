"use client";

import { useQuery } from "convex/react";

import { useOrganization, useUser } from "@clerk/nextjs";
import { ArrowBigLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import { Search } from "../_components/search";
import UploadFile from "../_components/upload-file";
import { Filecard } from "../_components/file-card";
import Image from "next/image";
export default function FileBrowser({
  title,
  favoritesOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  let orgId: any = null;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, query, favorites: favoritesOnly } : "skip"
  );
  const isLoading = files === undefined;

  return (
    <>
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
            {!query ? (
              <>
                <Image height={450} width={450} alt="image" src="/empty.svg" />
                <span className="text-2xl">
                  You have no file yet, upload one now.
                </span>
                <UploadFile />
              </>
            ) : (
              <>
                <Image
                  height={450}
                  width={450}
                  alt="image"
                  src="/searching.svg"
                  className="mx-auto"
                />
                <span className="text-2xl">No file found!</span>
                <div className="flex justify-center gap-4">
                  <Button
                    type="button"
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    <ArrowBigLeft /> Back
                  </Button>
                  <UploadFile />
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {files && files.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {title}
            </h1>
            <Search query="query" setQuery={setQuery} />
            <UploadFile />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {files?.map((file, indx) => <Filecard key={indx} file={file} />)}
          </div>
        </>
      )}
    </>
  );
}
