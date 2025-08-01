import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { BaseModalTitle } from "#/components/shared/modals/confirmation-modals/base-modal";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalBody } from "#/components/shared/modals/modal-body";
import { I18nKey } from "#/i18n/declaration";
import { useConversationMicroagents } from "#/hooks/query/use-conversation-microagents";
import { RootState } from "#/store";
import { AgentState } from "#/types/agent-state";
import { BrandButton } from "../settings/brand-button";

interface MicroagentsModalProps {
  onClose: () => void;
  conversationId: string | undefined;
}

export function MicroagentsModal({
  onClose,
  conversationId,
}: MicroagentsModalProps) {
  const { t } = useTranslation();
  const { curAgentState } = useSelector((state: RootState) => state.agent);
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>(
    {},
  );
  const {
    data: microagents,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useConversationMicroagents({
    agentState: curAgentState,
    conversationId,
    enabled: true,
  });

  const toggleAgent = (agentName: string) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [agentName]: !prev[agentName],
    }));
  };

  const isAgentReady = ![AgentState.LOADING, AgentState.INIT].includes(
    curAgentState,
  );

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalBody
        width="medium"
        className="max-h-[80vh] flex flex-col items-start"
        testID="microagents-modal"
      >
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between w-full">
            <BaseModalTitle title={t(I18nKey.MICROAGENTS_MODAL$TITLE)} />
            {isAgentReady && (
              <BrandButton
                testId="refresh-microagents"
                type="button"
                variant="primary"
                className="flex items-center gap-2"
                onClick={refetch}
                isDisabled={isLoading || isRefetching}
              >
                <RefreshCw
                  size={16}
                  className={`${isRefetching ? "animate-spin" : ""}`}
                />
                {t(I18nKey.BUTTON$REFRESH)}
              </BrandButton>
            )}
          </div>
        </div>

        {isAgentReady && (
          <span className="text-sm text-gray-400">
            {t(I18nKey.MICROAGENTS_MODAL$WARNING)}
          </span>
        )}

        <div className="w-full h-[60vh] overflow-auto rounded-md">
          {!isAgentReady && (
            <div className="w-full h-full flex items-center text-center justify-center text-2xl text-tertiary-light">
              {t(I18nKey.DIFF_VIEWER$WAITING_FOR_RUNTIME)}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          )}

          {!isLoading &&
            isAgentReady &&
            (isError || !microagents || microagents.length === 0) && (
              <div className="flex items-center justify-center h-full p-4">
                <p className="text-gray-400">
                  {isError
                    ? t(I18nKey.MICROAGENTS_MODAL$FETCH_ERROR)
                    : t(I18nKey.CONVERSATION$NO_MICROAGENTS)}
                </p>
              </div>
            )}

          {!isLoading &&
            isAgentReady &&
            microagents &&
            microagents.length > 0 && (
              <div className="p-2 space-y-3">
                {microagents.map((agent) => {
                  const isExpanded = expandedAgents[agent.name] || false;

                  return (
                    <div
                      key={agent.name}
                      className="rounded-md overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleAgent(agent.name)}
                        className="w-full py-3 px-2 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center">
                          <h3 className="font-bold text-gray-100">
                            {agent.name}
                          </h3>
                        </div>
                        <div className="flex items-center">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-800 mr-2">
                            {agent.type === "repo" ? "Repository" : "Knowledge"}
                          </span>
                          <span className="text-gray-300">
                            {isExpanded ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-2 pb-3 pt-1">
                          {agent.triggers && agent.triggers.length > 0 && (
                            <div className="mt-2 mb-3">
                              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                                {t(I18nKey.MICROAGENTS_MODAL$TRIGGERS)}
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {agent.triggers.map((trigger) => (
                                  <span
                                    key={trigger}
                                    className="px-2 py-1 text-xs rounded-full bg-blue-900"
                                  >
                                    {trigger}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-2">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">
                              {t(I18nKey.MICROAGENTS_MODAL$CONTENT)}
                            </h4>
                            <div className="text-sm mt-2 p-3 bg-gray-900 rounded-md overflow-auto text-gray-300 max-h-[400px] shadow-inner">
                              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {agent.content ||
                                  t(I18nKey.MICROAGENTS_MODAL$NO_CONTENT)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </ModalBody>
    </ModalBackdrop>
  );
}
