import React, { ReactNode } from "react";

import { CreatedByIcon, CreatedOnIcon, UpdatedByIcon, UpdatedOnIcon } from "@/lib/components";
import { IBaseEntityTimeStamps, IBaseEntityUserAuditsDTO } from "@/lib/models";

type CardBaseProps = {
  title?: string;
  actionButtons?: ReactNode;
  audits?: IBaseEntityUserAuditsDTO & IBaseEntityTimeStamps;
  children: ReactNode;
};

type AuditInfoType = { icon: ReactNode; infoType: string; infoValue?: string };
const AuditInfo = ({ icon, infoType, infoValue }: AuditInfoType) => {
  return (
    <div className="flex items-center text-sm">
      {icon}
      <span>
        <strong className="text-gray-600">{infoType}</strong>
        <br />
        {infoValue ?? "N/A"}
      </span>
    </div>
  );
};

const formatDate = (date: Date | string | undefined) => {
  const toDate = date && new Date(date);
  return toDate && `${toDate.toLocaleDateString()} ${toDate.toLocaleTimeString()}`;
};

export const CardBase = ({ title, actionButtons, audits, children }: CardBaseProps) => {
  return (
    <div className="w-full max-w-md transform overflow-hidden rounded-md bg-white shadow-md transition-all duration-100 hover:scale-[1.01] hover:border hover:border-gray-400 md:max-w-lg lg:max-w-2xl">
      <div className="p-5">
        <div className="flex items-center justify-between">
          {title && <h3 className="flex justify-start text-lg font-semibold text-gray-800">{title}</h3>}
          <div className="flex justify-end space-x-2">{actionButtons}</div>
        </div>

        <div className="mt-2 leading-relaxed text-gray-600">{children}</div>
      </div>

      {audits && (
        <div className="border-t border-gray-200 bg-gray-50 p-5">
          <h3 className="text-md mb-4 font-semibold text-gray-600">Audit Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <AuditInfo icon={<CreatedByIcon />} infoType="Created by" infoValue={audits.createdBy?.username} />
            <AuditInfo icon={<CreatedOnIcon />} infoType="Created on" infoValue={formatDate(audits.createdAt)} />
            <AuditInfo icon={<UpdatedByIcon />} infoType="Updated by" infoValue={audits.updatedBy?.username} />
            <AuditInfo icon={<UpdatedOnIcon />} infoType="Updated on" infoValue={formatDate(audits.updatedAt)} />
          </div>
        </div>
      )}
    </div>
  );
};
