"use client";

import { useRouter } from "next/navigation";

import Header from "@/components/organisms/header";
import { AuxiliaryFilesTable } from "../../components/AuxiliaryFilesTable";

import { Button } from "@/modules/chat/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/modules/chat/ui/card";

export default function AuxiliaryCatalogsView() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col gap-4">
      <Header title="Auxiliares LATAM" />
      {/* Main Content */}
      <Card className="border-none gap-2 p-6">
        <Button
          onClick={handleGoBack}
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-gray-900 w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a vista general
        </Button>

        <AuxiliaryFilesTable />
      </Card>
    </div>
  );
}
