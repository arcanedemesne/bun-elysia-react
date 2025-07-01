import React, { useState } from "react";

import { IOrganizationMinimalDTO, ITeamMinimalDTO } from "@/lib/models";
import { ChannelTypes } from "@/lib/types";

import { CloseIconButton } from "../Buttons";
import { ChatForm } from "./ChatForm";

type PopOutChatWrapperProps = {
  channel: ChannelTypes;
  organization?: IOrganizationMinimalDTO;
  team?: ITeamMinimalDTO;
  onClose: (id: string) => void;
};

export const PopOutChatWrapper = ({ channel, organization, team, onClose }: PopOutChatWrapperProps) => {
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const channelName = channel
    .split("-")
    .map((x) => x[0].toLocaleUpperCase() + x.slice(1, x.length).toLocaleLowerCase())
    .join(" ");

  const subChannelName = team?.name ?? organization?.name;
  const pulseAnimation = "[animation:pulse-text-color_2s_infinite_ease-in-out]";

  return (
    <div
      className={`border-1 fixed bottom-0 flex h-[calc(50%)] w-[calc(50%)] flex-col justify-center rounded-t-2xl border-gray-200 bg-gray-50 p-4 shadow-md hover:border-gray-400`}
    >
      <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-600">
        {channelName} - {subChannelName}{" "}
        {hasNewMessages && <span className={pulseAnimation + " ml-2"}>New Messages!</span>}
      </h4>
      <div>
        <CloseIconButton
          className="absolute mr-2 mt-1"
          onClick={() => (organization && onClose(organization.id)) || (team && onClose(team?.id))}
        />
      </div>
      <ChatForm
        channel={channel}
        organizationId={organization?.id}
        teamId={team?.id}
        setHasNewMessages={setHasNewMessages}
      />
    </div>
  );
};
