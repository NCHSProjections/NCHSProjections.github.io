-    togglePlayoffButton() {
-        const playoffBtn = document.getElementById('generateBracket');
-        if (!playoffBtn) return;
-        if (this.currentClass === 'Class 3A') {
-            playoffBtn.classList.add('visible');
-        } else {
-            playoffBtn.classList.remove('visible');
-        }
-    }
+    togglePlayoffButton() {
+        const playoffBtn = document.getElementById('generateBracket');
+        if (!playoffBtn) return;
+        const label = `View ${this.currentClass} Projected Playoff Standings`;
+        if (this.currentClass === 'Class 3A') {
+            playoffBtn.classList.add('visible');
+            playoffBtn.textContent = label;
+        } else {
+            playoffBtn.classList.remove('visible');
+            playoffBtn.textContent = label;
+        }
+    }
@@
     resetBracket() {
         const container = document.getElementById('bracketContainer');
         if (container) container.classList.remove('visible');
@@
-        const btn = document.getElementById('generateBracket'); if (btn) { btn.textContent = 'Generate 48-Team Playoff Bracket'; }
+        const btn = document.getElementById('generateBracket'); if (btn) { btn.textContent = `View ${this.currentClass} Projected Playoff Standings`; }
         this.bracketShown = false;
     }

