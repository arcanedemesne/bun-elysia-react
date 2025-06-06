import React, { useState } from "react";

import { IOrganizationMinimalDTO, ITeamMinimalDTO } from "@/lib/models";
import { ChannelTypes } from "@/lib/types";

import { CloseIconButton, MaximizeIconButton, MinimizeIconButton } from "../Buttons";
import { ChatForm } from "./ChatForm";

type PopOutChatWrapperProps = {
  channel: ChannelTypes;
  organization?: IOrganizationMinimalDTO;
  team?: ITeamMinimalDTO;
  onClose: (id: string) => void;
};

export const PopOutChatWrapper = ({ channel, organization, team, onClose }: PopOutChatWrapperProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const channelName = channel
    .split("-")
    .map((x) => x[0].toLocaleUpperCase() + x.slice(1, x.length).toLocaleLowerCase())
    .join(" ");

  const subChannelName = team?.name ?? organization?.name;

  return (
    <div
      className={`border-1 fixed bottom-0 flex h-${isMinimized ? "18" : "[calc(50%)]"} w-${isMinimized ? "100" : "[calc(50%)]"} flex-col justify-center rounded-t-2xl border-gray-200 bg-gray-50 p-4 shadow-md hover:border-gray-400`}
    >
      <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-600">
        {channelName} - {subChannelName}
      </h4>
      <div>
        {isMinimized && <MaximizeIconButton className="absolute mr-9 mt-1" onClick={() => setIsMinimized(false)} />}
        {!isMinimized && <MinimizeIconButton className="absolute mr-9 mt-2.5" onClick={() => setIsMinimized(true)} />}
        <CloseIconButton
          className="absolute mr-2 mt-1"
          onClick={() => (organization && onClose(organization.id)) || (team && onClose(team?.id))}
        />
      </div>
      {!isMinimized && <ChatForm {...{ channel, organization, team }} />}
    </div>
  );
};
