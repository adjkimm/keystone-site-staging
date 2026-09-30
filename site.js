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
  /* Domain normalization: strip scheme, path, query, fragment,
     trailing dots. "https://www.store.com/path" -> "www.store.com". */
  function normalizeDomain(raw) {
    var d = String(raw || "").trim().toLowerCase();
    d = d.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
    d = d.split(/[\/?#]/)[0];
    d = d.replace(/\.+$/, "");
    return d;
  }

  var form = document.getElementById("waitlist-form");
  if (form) {
    var status = document.getElementById("form-status");
    var nameField = document.getElementById("f-name");
    var emailField = document.getElementById("f-email");
    var companyField = document.getElementById("f-company");
    var submitBtn = form.querySelector('button[type="submit"]');

    function clearInvalid() {
      [nameField, emailField, companyField].forEach(function (f) {
        if (f) f.removeAttribute("aria-invalid");
      });
    }

    function fail(field, msg) {
      status.textContent = msg;
      if (field) {
        field.setAttribute("aria-invalid", "true");
        field.focus();
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearInvalid();
      var api = (typeof LEAD_API !== "undefined") ? LEAD_API : null;
      var siteId = (typeof LEAD_SITE_ID !== "undefined") ? LEAD_SITE_ID : "keystone";
      var checked = document.querySelector('input[name="track"]:checked');
      var track = checked ? checked.value : "merchant";

      var data = {
        site_id: siteId,
        name: nameField.value.trim(),
        email: emailField.value.trim().toLowerCase(),
        business: companyField.value.trim(),
        domain: normalizeDomain(document.getElementById("f-domain").value),
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

      if (data.name.length < 2) { fail(nameField, "Please enter your name."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { fail(emailField, "Please enter a valid email address."); return; }
      if (data.business.length < 2) { fail(companyField, "Please enter your company name."); return; }
      if (!api) {
        status.textContent = "The waitlist is not live yet. Your details were not sent anywhere.";
        return;
      }
      submitBtn.disabled = true;
      status.textContent = "Sending...";
      function enableBtn() { submitBtn.disabled = false; }
      fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok && res.body.ok) {
            form.reset();
            syncTrack();
            clearInvalid();
            status.textContent = "You are on the list. We will reach out when the pilot opens.";
          } else if (res.body && res.body.fields) {
            var first = Object.keys(res.body.fields)[0];
            status.textContent = res.body.fields[first] || "Please check the form and try again.";
          } else {
            status.textContent = "Something went wrong. Please try again.";
          }
        }, function () {
          status.textContent = "Something went wrong. Please try again.";
        })
        .then(enableBtn, enableBtn);
    });
  }
  /* ---- Free agent-access check (speed-test hero) ----
     GET ACCESS_API?domain=example.com -> per-agent verdicts.
     Honest framing: which agents CAN reach the store, not live visitors. */
  var accessForm = document.getElementById("access-form");
  if (accessForm) {
    var domainInput = document.getElementById("access-domain");
    var checkBtn = document.getElementById("access-btn");
    var statusEl = document.getElementById("access-status");
    var resultsEl = document.getElementById("access-results");
    var domainEl = document.getElementById("results-domain");
    var summaryEl = document.getElementById("results-summary");
    var listEl = document.getElementById("agent-list");

    var VERDICT_LABEL = {
      can_reach: "Can reach",
      blocked: "Blocked",
      unknown: "Unknown"
    };

    function setStatus(msg) {
      statusEl.textContent = msg;
      statusEl.hidden = !msg;
    }

    accessForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var domain = normalizeDomain(domainInput.value);
      if (!domain) {
        setStatus("Type a domain first, like yourstore.com.");
        return;
      }
      var api = (typeof ACCESS_API !== "undefined") ? ACCESS_API : null;
      if (!api) {
        setStatus("The checker is not live yet. Please try again later.");
        return;
      }
      checkBtn.disabled = true;
      resultsEl.hidden = true;
      setStatus("Checking…");

      /* Render sleeps the API when idle; wake-ups take 30-60s.
         25s timeout with an honest message instead of a hanging spinner. */
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 25000);

      fetch(api + "?domain=" + encodeURIComponent(domain), { signal: controller.signal })
        .then(function (r) {
          return r.json().then(function (j) { return { ok: r.ok, body: j }; });
        })
        .then(function (res) {
          clearTimeout(timer);
          checkBtn.disabled = false;
          if (!res.ok || !res.body || !res.body.agents) {
            setStatus((res.body && res.body.error) ||
              "Something went wrong. Please try again.");
            return;
          }
          var body = res.body;
          var s = body.summary;
          domainEl.textContent = domain;
          summaryEl.textContent = s.can_reach + " of " + s.total +
            " can reach \u00B7 " + s.blocked + " blocked \u00B7 " +
            s.unknown + " unknown";
          listEl.innerHTML = "";
          body.agents.forEach(function (a) {
            var li = document.createElement("li");
            li.className = "agent-row v-" + a.verdict;
            var dot = document.createElement("span");
            dot.className = "dot";
            dot.setAttribute("aria-hidden", "true");
            var main = document.createElement("div");
            main.className = "agent-main";
            var name = document.createElement("span");
            name.className = "agent-name";
            name.textContent = a.name;
            var kind = document.createElement("span");
            kind.className = "agent-kind";
            kind.textContent = a.kind;
            var note = document.createElement("span");
            note.className = "agent-note";
            note.textContent = a.blurb + " " + a.note;
            main.appendChild(name);
            main.appendChild(kind);
            main.appendChild(note);
            var verdict = document.createElement("span");
            verdict.className = "verdict";
            verdict.textContent = VERDICT_LABEL[a.verdict] || a.verdict;
            li.appendChild(dot);
            li.appendChild(main);
            li.appendChild(verdict);
            listEl.appendChild(li);
          });
          setStatus("");
          resultsEl.hidden = false;
        })
        .catch(function (err) {
          clearTimeout(timer);
          checkBtn.disabled = false;
          if (err && err.name === "AbortError") {
            setStatus("The checker is still waking up. Try again in a few seconds.");
          } else {
            setStatus("Something went wrong. Please try again.");
          }
        });
    });
  }
})();
