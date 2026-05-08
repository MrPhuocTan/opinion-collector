const API_BASE = "/api/v1/report";

async function previewReport() {
  const reqId = document.getElementById("reqId").value?.trim();
  const container = document.getElementById("report-preview");
  if (!reqId) {
    container.innerHTML = '<p class="error">Vui lòng nhập Req ID.</p>';
    return;
  }
  container.innerHTML = "Đang tải báo cáo...";

  try {
    const res = await fetch(`${API_BASE}/preview/${reqId}`, { headers: { "Accept": "application/json" } });
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} - ${text}`);
    }
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Server không trả JSON. Nhận được: ${text.slice(0, 120)}...`);
    }

    const data = await res.json();
    renderPreview(data);
  } catch (err) {
    console.error("Preview error:", err);
    container.innerHTML = `<p class="error">Không tải được báo cáo: ${err.message}</p>`;
  }
}

function renderPreview(data) {
  const container = document.getElementById("report-preview");
  if (!data || !data.documents) {
    container.innerHTML = '<p class="error">Không có dữ liệu.</p>';
    return;
  }

  let html = `<h2>${escapeHtml(data.reqName || "")}</h2>`;
  if (data.reqDes) html += `<p>${escapeHtml(String(data.reqDes))}</p>`;

  data.documents.forEach(doc => {
    html += `<h3>${escapeHtml(doc.docNum || "")} - ${escapeHtml(doc.docDes || "")}</h3>`;

    (doc.questions || []).forEach(q => {
      html += `<h4>${escapeHtml(q.queDes || "")}</h4>`;
      html += `<table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Department</th>
            <th>User</th>
            <th>Info</th>
            <th>Answer</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>`;

      (q.answers || []).forEach((a, idx) => {
        html += `<tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(a.department || "")}</td>
          <td>${escapeHtml(a.username || "")}</td>
          <td>${escapeHtml(a.userInfo || "")}</td>
          <td>${escapeHtml(a.ans_user || "")}</td>
          <td>${escapeHtml(a.ans_reason || "")}</td>
        </tr>`;
      });

      if (!q.answers || q.answers.length === 0) {
        html += `<tr><td colspan="6"><i>Không có câu trả lời</i></td></tr>`;
      }

      html += `</tbody></table>`;
    });
  });

  container.innerHTML = html;
}

function exportReport() {
  const reqId = document.getElementById("reqId").value?.trim();
  if (!reqId) {
    document.getElementById("report-preview").innerHTML = '<p class="error">Vui lòng nhập Req ID.</p>';
    return;
  }
  // Tải file .docx
  window.location.href = `${API_BASE}/export/${reqId}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
