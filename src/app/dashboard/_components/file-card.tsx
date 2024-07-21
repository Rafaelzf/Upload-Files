import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
("@/components/ui/dropdown-menu");

import { Doc } from "../../../../convex/_generated/dataModel";
import { formatRelative } from "date-fns";
import { FileTextIcon, GanttChartIcon, ImageIcon } from "lucide-react";
import { ReactNode } from "react";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/utils";
import { FilecardActions } from "./file-actions";

export function Filecard({
  file,
  favorites,
}: {
  file: Doc<"files">;
  favorites: Doc<"favorites">[];
}) {
  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });

  const isFavorited = favorites.some(
    (favorite) => favorite.fileId === file._id
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {file.name}
          <FilecardActions file={file} isFavorited={isFavorited} />
        </CardTitle>
        <CardDescription className="flex gap-2 items-center">
          {typeIcons[file.type]} {file.type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <></>
        {file.type === "pdf" ? (
          <Image src="/pdf.jpg" alt={file.name} width={300} height={300} />
        ) : (
          <Image
            src={getFileUrl(file.filedId)}
            alt={file.name}
            width={300}
            height={300}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="text-xs text-gray-700">
          Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
        </div>
      </CardFooter>
    </Card>
  );
}
