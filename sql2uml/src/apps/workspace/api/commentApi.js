// src/apps/workspace/api/commentApi.js

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
};

export const commentApi = {
  // Lấy tất cả comment của diagram
  getComments: (diagramId) =>
    fetch(`/api/diagrams/${diagramId}/comments`, {
      headers: headers(),
    }).then(handleResponse),

  // Lấy comment của 1 node
  getNodeComments: (diagramId, nodeId) =>
    fetch(`/api/diagrams/${diagramId}/comments/node/${nodeId}`, {
      headers: headers(),
    }).then(handleResponse),

  // Thêm comment
  addComment: (diagramId, payload) =>
    fetch(`/api/diagrams/${diagramId}/comments`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // Resolve comment
  resolveComment: (diagramId, commentId) =>
    fetch(`/api/diagrams/${diagramId}/comments/${commentId}/resolve`, {
      method: "PATCH",
      headers: headers(),
    }).then(handleResponse),

  // Xóa comment
  deleteComment: (diagramId, commentId) =>
    fetch(`/api/diagrams/${diagramId}/comments/${commentId}`, {
      method: "DELETE",
      headers: headers(),
    }).then(handleResponse),
};
