export function downloadBlob(response, filename) {
    const contentDisposition = response.headers["content-disposition"];
    // fallback filename
    const name = filename || (contentDisposition ? contentDisposition.split("filename=")[1]?.trim() : "downloaded-file");
    const blob = new Blob([response.data], { type: response.headers["content-type"] });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = name.replace(/['"]/g, "");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  