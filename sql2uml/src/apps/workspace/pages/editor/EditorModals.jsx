// src/apps/workspace/pages/editor/EditorModals.jsx
// Tách tất cả modals ra

import SaveDiagramModal from "../../components/modals/SaveDiagramModal";
import ShareModal from "../../components/modals/ShareModal";
import VersionHistoryPanel from "../../components/modals/VersionHistoryPanel";

export default function EditorModals({
  saveModalOpen,
  onCloseSave,
  onSave,
  shareModalOpen,
  onCloseShare,
  diagramId,
  historyModalOpen,
  onCloseHistory,
  onRestore,
}) {
  return (
    <>
      <SaveDiagramModal
        isOpen={saveModalOpen}
        onClose={onCloseSave}
        onSave={onSave}
      />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={onCloseShare}
        diagramId={diagramId}
        shareLink={
          diagramId ? `${window.location.origin}/shared/${diagramId}` : null
        }
      />
      <VersionHistoryPanel
        isOpen={historyModalOpen}
        onClose={onCloseHistory}
        diagramId={diagramId}
        onRestore={onRestore}
      />
    </>
  );
}
