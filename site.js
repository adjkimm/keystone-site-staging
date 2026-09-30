/* Applies config.js to every page: product name injection,
   nav state, footer year, waitlist form (track picker + lead API). */
(function () {
  "use strict";

  var name = (typeof PRODUCT_NAME !== "undefined") ? PRODUCT_NAME : "Agent identity for commerce";

  document.querySelectorAll("[data-product-name]").forEach(function (el) {
    el.textContent = name;
  });
  document.querySelectorAll("title").forEach(function (t) {
    t.textContent = t.textContent.replace(/\{\{PRODUCT_NAME\}\}/g, name);
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
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
  var params = new URLSearchParams(location.search);
  var trackParam = params.get("track");
  var trackRadios = document.querySelectorAll('input[name="track"]');

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

  if (trackRadios.length) {
    if (trackParam === "merchant" || trackParam === "builder") {
      var radio = document.querySelector('input[name="track"][value="' + trackParam + '"]');
      if (radio) radio.checked = true;
    }
    trackRadios.forEach(function (r) { r.addEventListener("change", syncTrack); });
    syncTrack();
  }

  /* Waitlist form submit -> shared lead API.
     Contract: {site_id, name, email, business, domain, source}.
     The track and the one track question fold into `source`
     (max 120 chars) since the API accepts no other fields. */
  var form = document.getElementById("waitlist-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      var api = (typeof LEAD_API !== "undefined") ? LEAD_API : null;
      var siteId = (typeof LEAD_SITE_ID !== "undefined") ? LEAD_SITE_ID : "keystone";
      var checked = document.querySelector('input[name="track"]:checked');
      var track = checked ? checked.value : "merchant";

      var data = {
        site_id: siteId,
        name: document.getElementById("f-name").value.trim(),
        email: document.getElementById("f-email").value.trim().toLowerCase(),
        business: document.getElementById("f-company").value.trim(),
        domain: document.getElementById("f-domain").value.trim().toLowerCase(),
        source: "waitlist-" + track
      };

      if (track === "merchant") {
        var traffic = document.getElementById("f-traffic");
        data.source += " | traffic:" + (traffic ? traffic.value : "not-sure");
      } else {
        var builds = document.getElementById("f-builds");
        if (builds && builds.value.trim()) {
          data.source += " | builds:" + builds.value.trim().slice(0, 60);
        }
      }
      data.source = data.source.slice(0, 120);

      if (data.name.length < 2) { status.textContent = "Please enter your name."; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { status.textContent = "Please enter a valid email address."; return; }
      if (data.business.length < 2) { status.textContent = "Please enter your company name."; return; }
      if (!api) {
        status.textContent = "The waitlist is not live yet. Your details were not sent anywhere.";
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
            syncTrack();
            status.textContent = "You are on the list. We will reach out when the pilot opens.";
          } else if (res.body && res.body.fields) {
            var first = Object.keys(res.body.fields)[0];
            status.textContent = res.body.fields[first] || "Please check the form and try again.";
          } else {
            status.textContent = "Something went wrong. Please try again.";
          }
        })
        .catch(function () { status.textContent = "Something went wrong. Please try again."; });
    });
  }
})();
