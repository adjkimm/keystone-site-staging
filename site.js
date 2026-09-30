/* Applies config.js to every page: product name injection,
   placeholder notice, nav state, footer year, waitlist form. */
(function () {
  var name = (typeof PRODUCT_NAME !== "undefined") ? PRODUCT_NAME : "Project Keystone";

  document.querySelectorAll("[data-product-name]").forEach(function (el) {
    el.textContent = name;
  });
  document.querySelectorAll("title").forEach(function (t) {
    t.textContent = t.textContent.replace(/\{\{PRODUCT_NAME\}\}/g, name);
  });

  var showNotice = (typeof SHOW_PLACEHOLDER_NOTICE !== "undefined") && SHOW_PLACEHOLDER_NOTICE;
  var notice = document.getElementById("placeholder-notice");
  if (notice && !showNotice) notice.remove();

  var year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = year;
  });

  /* Active nav link */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* Waitlist track preselect from ?track=merchant|builder */
  var track = new URLSearchParams(location.search).get("track");
  if (track === "merchant" || track === "builder") {
    var radio = document.querySelector('input[name="track"][value="' + track + '"]');
    if (radio) { radio.checked = true; syncTrack(); }
  }

  var trackRadios = document.querySelectorAll('input[name="track"]');
  trackRadios.forEach(function (r) { r.addEventListener("change", syncTrack); });

  function syncTrack() {
    var checked = document.querySelector('input[name="track"]:checked');
    if (!checked) return;
    var isMerchant = checked.value === "merchant";
    document.querySelectorAll(".track-merchant-only").forEach(function (el) {
      el.style.display = isMerchant ? "" : "none";
    });
    document.querySelectorAll(".track-builder-only").forEach(function (el) {
      el.style.display = isMerchant ? "none" : "";
    });
  }
  syncTrack();

  /* Waitlist form submit */
  var form = document.getElementById("waitlist-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      var api = (typeof LEAD_API !== "undefined") ? LEAD_API : null;
      var siteId = (typeof LEAD_SITE_ID !== "undefined") ? LEAD_SITE_ID : "keystone";
      var checked = document.querySelector('input[name="track"]:checked');
      var data = {
        site_id: siteId,
        name: document.getElementById("f-name").value.trim(),
        email: document.getElementById("f-email").value.trim().toLowerCase(),
        business: document.getElementById("f-company").value.trim(),
        domain: document.getElementById("f-domain").value.trim().toLowerCase(),
        source: "waitlist-" + (checked ? checked.value : "unknown")
      };
      if (data.name.length < 2) { status.textContent = "Please enter your name."; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { status.textContent = "Please enter a valid email address."; return; }
      if (!api) {
        status.textContent = "Preview mode: the waitlist is not live yet, so this was not sent. Your details were not recorded anywhere.";
        return;
      }
      status.textContent = "Sending...";
      fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok && res.body.ok) {
            form.reset();
            status.textContent = "You are on the list. We will reach out when the pilot opens.";
          } else {
            status.textContent = "Something went wrong. Please try again.";
          }
        })
        .catch(function () { status.textContent = "Something went wrong. Please try again."; });
    });
  }

  /* Demo verifier */
  var demoButtons = document.querySelectorAll("[data-demo-cred]");
  demoButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { runDemo(btn.getAttribute("data-demo-cred")); });
  });

  function runDemo(which) {
    var creds = {
      valid: {
        label: "DEMO credential A", agent: "shopper-agent-042",
        issuer: "Demo Issuer (non-production)", issued: "2026-09-29",
        expires: "2026-10-29", status: "VALID",
        detail: "Signature checks out. Issuer is recognized. Credential has not expired and is not revoked."
      },
      expired: {
        label: "DEMO credential B", agent: "shopper-agent-117",
        issuer: "Demo Issuer (non-production)", issued: "2026-07-01",
        expires: "2026-08-01", status: "EXPIRED",
        detail: "Signature checks out, but the credential expired on 2026-08-01. Treat this agent as unverified."
      },
      revoked: {
        label: "DEMO credential C", agent: "shopper-agent-309",
        issuer: "Demo Issuer (non-production)", issued: "2026-09-15",
        expires: "2026-10-15", status: "REVOKED",
        detail: "Signature checks out, but the issuer revoked this credential on 2026-09-28. Treat this agent as unverified."
      }
    };
    var c = creds[which];
    if (!c) return;
    var out = document.getElementById("demo-result");
    out.innerHTML = "";
    var cls = c.status === "VALID" ? "demo-valid" : "demo-bad";
    out.innerHTML =
      '<div class="demo-card ' + cls + '">' +
      '<div class="demo-watermark">DEMO</div>' +
      "<p><strong>" + c.label + "</strong></p>" +
      "<dl>" +
      "<div><dt>Agent</dt><dd>" + c.agent + "</dd></div>" +
      "<div><dt>Issuer</dt><dd>" + c.issuer + "</dd></div>" +
      "<div><dt>Issued</dt><dd>" + c.issued + "</dd></div>" +
      "<div><dt>Expires</dt><dd>" + c.expires + "</dd></div>" +
      "<div><dt>Result</dt><dd><strong>" + c.status + "</strong></dd></div>" +
      "</dl>" +
      "<p>" + c.detail + "</p>" +
      "<p class='demo-fine'>This demo uses fake credentials that cannot be mistaken for real ones. " +
      "A passing check means the agent is who it claims to be. It never means the agent is safe.</p>" +
      "</div>";
    if (out.scrollIntoView) out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
})();
