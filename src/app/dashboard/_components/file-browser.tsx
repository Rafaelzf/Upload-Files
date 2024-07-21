"use client";

import { useQuery } from "convex/react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { ArrowBigLeft, GridIcon, Loader2, RowsIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../../../../convex/_generated/api";
import { Search } from "../_components/search";
import UploadFile from "../_components/upload-file";
import { Filecard } from "../_components/file-card";
import Image from "next/image";
import { DataTable } from "./file-table";
import { columns } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Doc } from "../../../../convex/_generated/dataModel";
export default function FileBrowser({
  title,
  favoritesOnly,
  deletedOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
  deletedOnly?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<Doc<"files">["type"] | "all">("all");

  let orgId: any = null;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );

  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
          type: type === "all" ? undefined : type,
          query,
          favorites: favoritesOnly,
          deletedOnly,
        }
      : "skip"
  );
  const isLoading = files === undefined;

  const modifiedFiles =
    files?.map((file) => ({
      ...file,
      isFavorited: (favorites ?? []).some(
        (favorite) => favorite.fileId === file._id
      ),
    })) ?? [];

  return (
    <>
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

      {modifiedFiles && modifiedFiles.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {title}
            </h1>
            <Search query="query" setQuery={setQuery} />
            <UploadFile />
          </div>

          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center">
              <TabsList className="mb-2">
                <TabsTrigger value="grid" className="flex gap-2 items-center">
                  <GridIcon />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="table" className="flex gap-2 items-center">
                  <RowsIcon /> Table
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2 items-center">
                <Label>Type Filter</Label>
                <Select
                  value={type}
                  onValueChange={(newType) => {
                    setType(newType as any);
                  }}
                >
                  <SelectTrigger id="type-select" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
            <TabsContent value="grid">
              <div className="grid grid-cols-3 gap-4">
                {modifiedFiles?.map((file, indx) => (
                  <Filecard
                    key={indx}
                    file={file}
                    favorites={favorites ?? []}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="table">
              <DataTable columns={columns} data={modifiedFiles} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}
