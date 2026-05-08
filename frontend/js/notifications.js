class NotificationManager {
   static show(message, type = 'success', duration = 3000) {
       const notification = document.createElement('div');
       notification.className = `notification ${type}`;
       notification.textContent = message;
       document.body.appendChild(notification);
       
       setTimeout(() => {
           notification.style.animation = 'slideOut 0.3s ease-out forwards';
           setTimeout(() => notification.remove(), 300);
       }, duration);
   }
   
   static success(message) {
       this.show(message, 'success');
   }
   
   static error(message) {
       this.show(message, 'error');
   }
}

// Add loading overlay
class LoadingOverlay {
   static show() {
       const overlay = document.createElement('div');
       overlay.id = 'loadingOverlay';
       overlay.className = 'loading-overlay';
       overlay.innerHTML = '<div class="spinner"></div>';
       document.body.appendChild(overlay);
   }
   
   static hide() {
       const overlay = document.getElementById('loadingOverlay');
       if (overlay) overlay.remove();
   }
}
