"use client";

import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId = null;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const createFile = useMutation(api.files.createFiles);
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {files?.map((file, indx) => (
        <div key={indx}>
          Team:{file.name} - Id: {file._id}
        </div>
      ))}
      <Button
        onClick={() => {
          if (!orgId) return;
          createFile({
            name: `new file from ${orgId}`,
            orgId,
          });
        }}
      >
        Clique
      </Button>
    </main>
  );
}
