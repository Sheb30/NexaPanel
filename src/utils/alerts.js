
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function isDarkMode() {
  return Boolean(
    document.documentElement.classList.contains("theme-dark") ||
      document.body.classList.contains("theme-dark") ||
      document.querySelector(".theme-dark"),
  );
}

function getThemeClasses() {
  return {
    popup: isDarkMode()
      ? "nexapanel-swal-popup nexapanel-swal-popup--dark"
      : "nexapanel-swal-popup",
    title: "nexapanel-swal-title",
    htmlContainer: "nexapanel-swal-content",
    confirmButton: "nexapanel-swal-confirm",
    cancelButton: "nexapanel-swal-cancel",
  };
}

export function confirmDelete({
  title = "Delete this item?",
  text = "This action cannot be undone.",
  confirmText = "Yes, delete",
  cancelText = "Cancel",
} = {}) {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
    focusCancel: true,
    allowOutsideClick: false,
    buttonsStyling: true,
    customClass: getThemeClasses(),
  });
}

export function showSuccess({
  title = "Success",
  text = "",
  confirmText = "Done",
} = {}) {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: confirmText,
    confirmButtonColor: "#6366f1",
    timer: 2200,
    timerProgressBar: true,
    customClass: getThemeClasses(),
  });
}

export function showError({
  title = "Something went wrong",
  text = "Please try again.",
  confirmText = "OK",
} = {}) {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: confirmText,
    confirmButtonColor: "#6366f1",
    customClass: getThemeClasses(),
  });
}
