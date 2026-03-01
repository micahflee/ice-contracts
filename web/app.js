const stateCentroids = {
  AL: [32.806671, -86.79113],
  AK: [61.370716, -152.404419],
  AZ: [33.729759, -111.431221],
  AR: [34.969704, -92.373123],
  CA: [36.116203, -119.681564],
  CO: [39.059811, -105.311104],
  CT: [41.597782, -72.755371],
  DE: [39.318523, -75.507141],
  FL: [27.766279, -81.686783],
  GA: [33.040619, -83.643074],
  HI: [21.094318, -157.498337],
  ID: [44.240459, -114.478828],
  IL: [40.349457, -88.986137],
  IN: [39.849426, -86.258278],
  IA: [42.011539, -93.210526],
  KS: [38.5266, -96.726486],
  KY: [37.66814, -84.670067],
  LA: [31.169546, -91.867805],
  ME: [44.693947, -69.381927],
  MD: [39.063946, -76.802101],
  MA: [42.230171, -71.530106],
  MI: [43.326618, -84.536095],
  MN: [45.694454, -93.900192],
  MS: [32.741646, -89.678696],
  MO: [38.456085, -92.288368],
  MT: [46.921925, -110.454353],
  NE: [41.12537, -98.268082],
  NV: [38.313515, -117.055374],
  NH: [43.452492, -71.563896],
  NJ: [40.298904, -74.521011],
  NM: [34.840515, -106.248482],
  NY: [42.165726, -74.948051],
  NC: [35.630066, -79.806419],
  ND: [47.528912, -99.784012],
  OH: [40.388783, -82.764915],
  OK: [35.565342, -96.928917],
  OR: [44.572021, -122.070938],
  PA: [40.590752, -77.209755],
  RI: [41.680893, -71.51178],
  SC: [33.856892, -80.945007],
  SD: [44.299782, -99.438828],
  TN: [35.747845, -86.692345],
  TX: [31.054487, -97.563461],
  UT: [40.150032, -111.862434],
  VT: [44.045876, -72.710686],
  VA: [37.769337, -78.169968],
  WA: [47.400902, -121.490494],
  WV: [38.491226, -80.954453],
  WI: [44.268543, -89.616508],
  WY: [42.755966, -107.30249],
  DC: [38.9072, -77.0369]
};

const ui = {
  searchInput: document.getElementById("searchInput"),
  programFilter: document.getElementById("programFilter"),
  awardTypeFilter: document.getElementById("awardTypeFilter"),
  phaseTypeFilter: document.getElementById("phaseTypeFilter"),
  stateFilter: document.getElementById("stateFilter"),
  minYearFilter: document.getElementById("minYearFilter"),
  maxYearFilter: document.getElementById("maxYearFilter"),
  minAwardFilter: document.getElementById("minAwardFilter"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  detailModal: document.getElementById("detailModal"),
  detailModalTitle: document.getElementById("detailModalTitle"),
  detailModalBody: document.getElementById("detailModalBody"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  metricsPanel: document.getElementById("metricsPanel"),
  companiesFilterSummary: document.getElementById("companiesFilterSummary"),
  contractsFilterSummary: document.getElementById("contractsFilterSummary"),
  companiesTableBody: document.getElementById("companiesTableBody"),
  contractsTableBody: document.getElementById("contractsTableBody")
};

const defaultSortState = {
  companies: {
    key: "totalAward",
    dir: "desc"
  },
  contracts: {
    key: "awardAmount",
    dir: "desc"
  }
};

const appState = {
  contracts: [],
  contractorsRaw: null,
  contractorsByNormalizedName: null,
  summaryMetrics: null,
  map: null,
  mapLayerGroup: null,
  modal: {
    type: null,
    companyKey: null,
    awardId: null
  },
  sort: {
    companies: {
      key: defaultSortState.companies.key,
      dir: defaultSortState.companies.dir
    },
    contracts: {
      key: defaultSortState.contracts.key,
      dir: defaultSortState.contracts.dir
    }
  }
};

const queryKeys = {
  search: "search",
  program: "program",
  awardType: "awardType",
  phaseType: "phaseType",
  state: "state",
  minYear: "minYear",
  maxYear: "maxYear",
  minAward: "minAward",
  companySortKey: "companySortKey",
  companySortDir: "companySortDir",
  contractSortKey: "contractSortKey",
  contractSortDir: "contractSortDir",
  modalType: "modalType",
  modalCompany: "modalCompany",
  modalAwardId: "modalAwardId"
};

const sortConfig = {
  companies: {
    companyName: {
      defaultDir: "asc",
      getter: (row) => row.companyName || ""
    },
    contractCount: {
      defaultDir: "desc",
      getter: (row) => Number(row.contractCount || 0)
    },
    totalAward: {
      defaultDir: "desc",
      getter: (row) => Number(row.totalAward || 0)
    },
    totalObligation: {
      defaultDir: "desc",
      getter: (row) => Number(row.totalObligation || 0)
    }
  },
  contracts: {
    awardId: {
      defaultDir: "desc",
      getter: (row) => Number(row.awardId || 0)
    },
    companyName: {
      defaultDir: "asc",
      getter: (row) => row.companyName || ""
    },
    programName: {
      defaultDir: "asc",
      getter: (row) => row.programName || ""
    },
    phaseType: {
      defaultDir: "asc",
      getter: (row) => row.phaseTypeDesc || row.phaseType || ""
    },
    awardType: {
      defaultDir: "asc",
      getter: (row) => row.awardTypeDesc || row.awardType || ""
    },
    popStartDate: {
      defaultDir: "desc",
      getter: (row) => row.popStartDate || ""
    },
    popEndDate: {
      defaultDir: "desc",
      getter: (row) => row.popEndDate || ""
    },
    awardAmount: {
      defaultDir: "desc",
      getter: (row) => Number(row.awardAmount || 0)
    },
    state: {
      defaultDir: "asc",
      getter: (row) => row.companyStateCd || ""
    }
  }
};

const numberFormatter = new Intl.NumberFormat("en-US");
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const compactMoneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1
});

function safeMoney(value) {
  const numeric = Number(value ?? 0);
  return moneyFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}

function compactMoney(value) {
  const numeric = Number(value ?? 0);
  return compactMoneyFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}

function safeNumber(value) {
  const numeric = Number(value ?? 0);
  return numberFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeCompanyName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeExternalUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return null;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}

function formatDetailValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function renderDetailGrid(entries) {
  return `
    <div class="detail-grid">
      ${entries
        .map(
          ({ key, value }) =>
            `<div class="detail-item"><div class="detail-key">${escapeHtml(key)}</div><div class="detail-value">${escapeHtml(
              formatDetailValue(value)
            )}</div></div>`
        )
        .join("")}
    </div>
  `;
}

function isValidSortKey(table, key) {
  return Boolean(sortConfig[table] && sortConfig[table][key]);
}

function normalizeSortDir(dir) {
  return dir === "asc" ? "asc" : "desc";
}

function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

function sortRows(rows, table) {
  const { key, dir } = appState.sort[table];
  const getter = sortConfig[table][key].getter;

  const sortedRows = [...rows].sort((left, right) => {
    const leftValue = getter(left);
    const rightValue = getter(right);
    const baseComparison = compareValues(leftValue, rightValue);
    return dir === "asc" ? baseComparison : -baseComparison;
  });

  return sortedRows;
}

function setSort(table, key) {
  if (!isValidSortKey(table, key)) {
    return;
  }

  const current = appState.sort[table];
  const defaultDir = sortConfig[table][key].defaultDir;

  if (current.key === key) {
    current.dir = current.dir === "asc" ? "desc" : "asc";
  } else {
    current.key = key;
    current.dir = defaultDir;
  }
}

function updateSortHeaderIndicators() {
  const headers = document.querySelectorAll("th[data-table][data-sort-key]");

  headers.forEach((header) => {
    const table = header.dataset.table;
    const key = header.dataset.sortKey;
    const baseLabel = header.dataset.label || header.textContent || "";
    const isActive = appState.sort[table].key === key;
    const dir = appState.sort[table].dir;

    header.textContent = `${baseLabel}${isActive ? (dir === "asc" ? " ↑" : " ↓") : ""}`;
    header.setAttribute("aria-sort", isActive ? (dir === "asc" ? "ascending" : "descending") : "none");
  });
}

function initializeSortableHeaders() {
  const headers = document.querySelectorAll("th[data-table][data-sort-key]");

  headers.forEach((header) => {
    const table = header.dataset.table;
    const key = header.dataset.sortKey;

    header.classList.add("sortable");
    header.setAttribute("role", "button");
    header.tabIndex = 0;

    header.addEventListener("click", () => {
      setSort(table, key);
      render();
    });

    header.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setSort(table, key);
        render();
      }
    });
  });

  updateSortHeaderIndicators();
}

function populateSelect(selectEl, values) {
  const options = values
    .filter((value) => value !== null && value !== undefined && value !== "")
    .sort((a, b) => String(a).localeCompare(String(b)));

  options.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectEl.appendChild(option);
  });
}

function initMap() {
  appState.map = L.map("map", {
    zoomControl: true,
    minZoom: 3,
    maxZoom: 10
  }).setView([39.5, -98.35], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(appState.map);

  appState.mapLayerGroup = L.layerGroup().addTo(appState.map);
}

function getFilterValues() {
  const searchRaw = ui.searchInput.value.trim();

  return {
    search: searchRaw.toLowerCase(),
    program: ui.programFilter.value,
    awardType: ui.awardTypeFilter.value,
    phaseType: ui.phaseTypeFilter.value,
    state: ui.stateFilter.value,
    minYear: ui.minYearFilter.value ? Number(ui.minYearFilter.value) : null,
    maxYear: ui.maxYearFilter.value ? Number(ui.maxYearFilter.value) : null,
    minAward: ui.minAwardFilter.value ? Number(ui.minAwardFilter.value) : null
  };
}

function getRawFilterInputValues() {
  return {
    search: ui.searchInput.value.trim(),
    program: ui.programFilter.value,
    awardType: ui.awardTypeFilter.value,
    phaseType: ui.phaseTypeFilter.value,
    state: ui.stateFilter.value,
    minYear: ui.minYearFilter.value,
    maxYear: ui.maxYearFilter.value,
    minAward: ui.minAwardFilter.value
  };
}

function setSelectValueIfValid(selectElement, value) {
  if (!value) {
    selectElement.value = "";
    return;
  }

  const hasOption = Array.from(selectElement.options).some((option) => option.value === value);
  selectElement.value = hasOption ? value : "";
}

function applyFilterInputsFromQuery() {
  const params = new URLSearchParams(window.location.search);

  appState.sort.companies.key = defaultSortState.companies.key;
  appState.sort.companies.dir = defaultSortState.companies.dir;
  appState.sort.contracts.key = defaultSortState.contracts.key;
  appState.sort.contracts.dir = defaultSortState.contracts.dir;

  ui.searchInput.value = params.get(queryKeys.search) || "";
  setSelectValueIfValid(ui.programFilter, params.get(queryKeys.program) || "");
  setSelectValueIfValid(ui.awardTypeFilter, params.get(queryKeys.awardType) || "");
  setSelectValueIfValid(ui.phaseTypeFilter, params.get(queryKeys.phaseType) || "");
  setSelectValueIfValid(ui.stateFilter, params.get(queryKeys.state) || "");

  const minYear = params.get(queryKeys.minYear) || "";
  const maxYear = params.get(queryKeys.maxYear) || "";
  const minAward = params.get(queryKeys.minAward) || "";

  ui.minYearFilter.value = /^\d{4}$/.test(minYear) ? minYear : "";
  ui.maxYearFilter.value = /^\d{4}$/.test(maxYear) ? maxYear : "";
  ui.minAwardFilter.value = /^\d+(\.\d+)?$/.test(minAward) ? minAward : "";

  const companySortKey = params.get(queryKeys.companySortKey);
  const companySortDir = params.get(queryKeys.companySortDir);
  if (companySortKey && isValidSortKey("companies", companySortKey)) {
    appState.sort.companies.key = companySortKey;
  }
  if (companySortDir) {
    appState.sort.companies.dir = normalizeSortDir(companySortDir);
  }

  const contractSortKey = params.get(queryKeys.contractSortKey);
  const contractSortDir = params.get(queryKeys.contractSortDir);
  if (contractSortKey && isValidSortKey("contracts", contractSortKey)) {
    appState.sort.contracts.key = contractSortKey;
  }
  if (contractSortDir) {
    appState.sort.contracts.dir = normalizeSortDir(contractSortDir);
  }

  const modalType = params.get(queryKeys.modalType);
  const modalCompany = params.get(queryKeys.modalCompany);
  const modalAwardId = params.get(queryKeys.modalAwardId);

  appState.modal.type = null;
  appState.modal.companyKey = null;
  appState.modal.awardId = null;

  if (modalType === "company" && modalCompany) {
    appState.modal.type = "company";
    appState.modal.companyKey = modalCompany;
  } else if (modalType === "contract" && modalAwardId && /^\d+$/.test(modalAwardId)) {
    appState.modal.type = "contract";
    appState.modal.awardId = Number(modalAwardId);
  }
}

function syncQueryFromFilterInputs() {
  const rawValues = getRawFilterInputValues();
  const params = new URLSearchParams();

  Object.entries(rawValues).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      params.set(queryKeys[key], String(value));
    }
  });

  if (
    appState.sort.companies.key !== defaultSortState.companies.key ||
    appState.sort.companies.dir !== defaultSortState.companies.dir
  ) {
    params.set(queryKeys.companySortKey, appState.sort.companies.key);
    params.set(queryKeys.companySortDir, appState.sort.companies.dir);
  }

  if (
    appState.sort.contracts.key !== defaultSortState.contracts.key ||
    appState.sort.contracts.dir !== defaultSortState.contracts.dir
  ) {
    params.set(queryKeys.contractSortKey, appState.sort.contracts.key);
    params.set(queryKeys.contractSortDir, appState.sort.contracts.dir);
  }

  if (appState.modal.type === "company" && appState.modal.companyKey) {
    params.set(queryKeys.modalType, "company");
    params.set(queryKeys.modalCompany, appState.modal.companyKey);
  } else if (appState.modal.type === "contract" && appState.modal.awardId !== null) {
    params.set(queryKeys.modalType, "contract");
    params.set(queryKeys.modalAwardId, String(appState.modal.awardId));
  }

  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState({}, "", nextUrl);
  }
}

async function ensureContractorsRawLoaded() {
  if (appState.contractorsRaw && appState.contractorsByNormalizedName) {
    return;
  }

  const contractorsRaw = await loadJson("../data/dhs_contractors.json");
  const contractorsByNormalizedName = new Map();

  contractorsRaw.forEach((row) => {
    const key = normalizeCompanyName(row.name);
    if (!key) {
      return;
    }

    if (!contractorsByNormalizedName.has(key)) {
      contractorsByNormalizedName.set(key, []);
    }

    contractorsByNormalizedName.get(key).push(row);
  });

  appState.contractorsRaw = contractorsRaw;
  appState.contractorsByNormalizedName = contractorsByNormalizedName;
}

function openCompanyModalByKey(companyKey) {
  if (!companyKey) {
    return;
  }

  appState.modal.type = "company";
  appState.modal.companyKey = companyKey;
  appState.modal.awardId = null;
  render();
}

function openContractModalByAwardId(awardId) {
  const parsedAwardId = Number(awardId);
  if (!Number.isFinite(parsedAwardId)) {
    return;
  }

  appState.modal.type = "contract";
  appState.modal.awardId = parsedAwardId;
  appState.modal.companyKey = null;
  render();
}

function closeDetailModal() {
  if (!appState.modal.type) {
    return;
  }

  appState.modal.type = null;
  appState.modal.companyKey = null;
  appState.modal.awardId = null;
  render();
}

function showModal(title, bodyHtml) {
  ui.detailModalTitle.textContent = title;
  ui.detailModalBody.innerHTML = bodyHtml;
  ui.detailModal.classList.remove("hidden");
  ui.detailModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function hideModal() {
  ui.detailModal.classList.add("hidden");
  ui.detailModal.setAttribute("aria-hidden", "true");
  ui.detailModalBody.innerHTML = "";
  document.body.style.overflow = "";
}

function renderCompanyContractsTable(companyContracts) {
  const rows = companyContracts
    .map(
      (contract) => `
        <tr>
          <td><button class="link-button" type="button" data-open-contract="${contract.awardId}">${escapeHtml(contract.awardId)}</button></td>
          <td>${escapeHtml(contract.programName || "")}</td>
          <td>${escapeHtml(contract.phaseTypeDesc || contract.phaseType || "")}</td>
          <td>${escapeHtml(contract.awardTypeDesc || contract.awardType || "")}</td>
          <td>${escapeHtml(contract.popStartDate || "")}</td>
          <td>${escapeHtml(contract.popEndDate || "")}</td>
          <td>${escapeHtml(safeMoney(contract.awardAmount || 0))}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div class="inline-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Award ID</th>
            <th>Program</th>
            <th>Phase</th>
            <th>Award Type</th>
            <th>Start</th>
            <th>End</th>
            <th>Award</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7">No contracts found.</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

async function renderCompanyModal(companyKey) {
  const contractsForCompany = appState.contracts
    .filter((contract) => contract.normalizedCompanyName === companyKey)
    .sort((a, b) => Number(b.awardAmount || 0) - Number(a.awardAmount || 0));

  await ensureContractorsRawLoaded();
  const contractorRecords = appState.contractorsByNormalizedName.get(companyKey) || [];
  const primaryContractorRecord = contractorRecords[0] || null;
  const primaryCompanyContact = contractorRecords.find((record) => record?.companyContact)?.companyContact || null;
  const primaryCompanyPOC = contractorRecords.find((record) => record?.companyPOC)?.companyPOC || null;
  const companyUrl = primaryContractorRecord?.companyURL || null;
  const companyUrlHref = normalizeExternalUrl(companyUrl);
  const displayName =
    contractsForCompany[0]?.companyName || contractorRecords[0]?.name || companyKey || "Unknown Company";

  const totalAward = contractsForCompany.reduce((sum, item) => sum + Number(item.awardAmount || 0), 0);
  const totalObligation = contractsForCompany.reduce((sum, item) => sum + Number(item.currentObligationAmount || 0), 0);

  const bodyHtml = `
    <h3 class="modal-section-title">Company Summary</h3>
    ${renderDetailGrid([
      { key: "Company Name", value: displayName },
      { key: "Normalized Key", value: companyKey },
      { key: "Matched Contractor Records", value: contractorRecords.length },
      { key: "Awarded Contracts", value: contractsForCompany.length },
      { key: "Total Award", value: safeMoney(totalAward) },
      { key: "Total Obligation", value: safeMoney(totalObligation) }
    ])}

    ${
      companyUrlHref
        ? `<h3 class="modal-section-title">Company URL</h3>
    <p class="detail-value"><a href="${escapeHtml(companyUrlHref)}" target="_blank" rel="noreferrer noopener" referrerpolicy="no-referrer">${escapeHtml(
            companyUrl
          )}</a></p>`
        : ""
    }

    <h3 class="modal-section-title">Company Contact</h3>
    ${
      primaryCompanyContact
        ? renderDetailGrid([
            { key: "Name", value: [primaryCompanyContact.firstName, primaryCompanyContact.middleName, primaryCompanyContact.lastName].filter(Boolean).join(" ") },
            { key: "Title", value: primaryCompanyContact.title },
            { key: "Email", value: primaryCompanyContact.email },
            { key: "Phone", value: primaryCompanyContact.phoneNumber },
            { key: "Address 1", value: primaryCompanyContact.addressOne },
            { key: "Address 2", value: primaryCompanyContact.addressTwo },
            { key: "City", value: primaryCompanyContact.city },
            { key: "State", value: primaryCompanyContact.state?.name || primaryCompanyContact.state?.description },
            { key: "Zipcode", value: primaryCompanyContact.zipcode },
            { key: "Country", value: primaryCompanyContact.country?.name || primaryCompanyContact.country?.description }
          ])
        : '<p class="detail-value">No companyContact data available.</p>'
    }

    <h3 class="modal-section-title">Company POC</h3>
    ${
      primaryCompanyPOC
        ? renderDetailGrid([
            { key: "Name", value: [primaryCompanyPOC.firstName, primaryCompanyPOC.middleName, primaryCompanyPOC.lastName].filter(Boolean).join(" ") },
            { key: "Title", value: primaryCompanyPOC.title },
            { key: "Email", value: primaryCompanyPOC.email },
            { key: "Phone", value: primaryCompanyPOC.phoneNumber },
            { key: "Address 1", value: primaryCompanyPOC.addressOne },
            { key: "Address 2", value: primaryCompanyPOC.addressTwo },
            { key: "City", value: primaryCompanyPOC.city },
            { key: "State", value: primaryCompanyPOC.state?.name || primaryCompanyPOC.state?.description },
            { key: "Zipcode", value: primaryCompanyPOC.zipcode },
            { key: "Country", value: primaryCompanyPOC.country?.name || primaryCompanyPOC.country?.description }
          ])
        : '<p class="detail-value">No companyPOC data available.</p>'
    }

    <h3 class="modal-section-title">Contracts Awarded</h3>
    ${renderCompanyContractsTable(contractsForCompany)}

    <details class="json-disclosure">
      <summary class="json-disclosure-summary"><span class="arrow">▾</span> All Matched Contractor Record Data (JSON)</summary>
      ${
        contractorRecords.length
          ? contractorRecords
              .map(
                (record, idx) =>
                  `<h4 class="modal-section-title">Contractor Record ${idx + 1}</h4><pre class="json-block">${escapeHtml(
                    JSON.stringify(record, null, 2)
                  )}</pre>`
              )
              .join("")
          : '<p class="detail-value">No exact contractor record matched this company key.</p>'
      }
    </details>
  `;

  showModal(`Company Detail: ${displayName}`, bodyHtml);
}

function renderContractModal(awardId) {
  const contract = appState.contracts.find((row) => Number(row.awardId) === Number(awardId));
  if (!contract) {
    closeDetailModal();
    return;
  }

  const companyKey = contract.normalizedCompanyName || normalizeCompanyName(contract.companyName);
  const bodyHtml = `
    <h3 class="modal-section-title">Contract Summary</h3>
    ${renderDetailGrid([
      { key: "Award ID", value: contract.awardId },
      { key: "Company", value: contract.companyName },
      { key: "Program", value: contract.programName },
      { key: "Phase", value: contract.phaseTypeDesc || contract.phaseType },
      { key: "Award Type", value: contract.awardTypeDesc || contract.awardType },
      { key: "Start Date", value: contract.popStartDate },
      { key: "End Date", value: contract.popEndDate },
      { key: "Award Amount", value: safeMoney(contract.awardAmount || 0) },
      { key: "Current Obligation", value: safeMoney(contract.currentObligationAmount || 0) }
    ])}

    <h3 class="modal-section-title">Proposal Abstract</h3>
    <p class="detail-value">${escapeHtml(contract.proposalAbstract || "No proposal abstract available.")}</p>

    <h3 class="modal-section-title">Company Contact</h3>
    ${renderDetailGrid([
      { key: "Contact Name", value: contract.companyContactName },
      { key: "Contact Title", value: contract.companyContactTitle },
      { key: "Company Name", value: contract.companyName },
      { key: "Address", value: contract.companyAddress },
      { key: "City", value: contract.companyCity },
      { key: "State", value: contract.companyState || contract.companyStateCd },
      { key: "Zipcode", value: contract.companyZipCode }
    ])}

    <p>
      <button class="link-button" type="button" data-open-company="${escapeHtml(companyKey)}">Open company detail: ${escapeHtml(
    contract.companyName || "Unknown"
  )}</button>
    </p>

    <details class="json-disclosure">
      <summary class="json-disclosure-summary"><span class="arrow">▾</span> All Contract Field Data (JSON)</summary>
      <pre class="json-block">${escapeHtml(JSON.stringify(contract, null, 2))}</pre>
    </details>
  `;

  showModal(`Contract Detail: Award ${contract.awardId}`, bodyHtml);
}

function renderDetailModal() {
  if (!appState.modal.type) {
    hideModal();
    return;
  }

  if (appState.modal.type === "company" && appState.modal.companyKey) {
    renderCompanyModal(appState.modal.companyKey).catch((error) => {
      showModal(
        "Company Detail",
        `<p class="detail-value">Failed to load company detail: ${escapeHtml(error.message || String(error))}</p>`
      );
    });
    return;
  }

  if (appState.modal.type === "contract" && appState.modal.awardId !== null) {
    renderContractModal(appState.modal.awardId);
    return;
  }

  hideModal();
}

function buildSearchText(contract) {
  return [
    contract.companyName,
    contract.proposalTitle,
    contract.proposalAbstract,
    contract.topicTitle,
    contract.solicitationTitle,
    contract.programName,
    contract.companyStateCd
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function contractMatches(contract, filters) {
  if (filters.program && contract.programName !== filters.program) {
    return false;
  }

  if (filters.awardType && contract.awardType !== filters.awardType) {
    return false;
  }

  if (filters.phaseType && contract.phaseType !== filters.phaseType) {
    return false;
  }

  if (filters.state && contract.companyStateCd !== filters.state) {
    return false;
  }

  if (filters.minYear !== null && Number(contract.popStartYear) < filters.minYear) {
    return false;
  }

  if (filters.maxYear !== null && Number(contract.popStartYear) > filters.maxYear) {
    return false;
  }

  if (filters.minAward !== null && Number(contract.awardAmount) < filters.minAward) {
    return false;
  }

  if (filters.search) {
    return buildSearchText(contract).includes(filters.search);
  }

  return true;
}

function buildHumanReadableFilterSummary(filters) {
  const parts = [];

  if (filters.search) {
    parts.push(`search contains "${ui.searchInput.value.trim()}"`);
  }

  if (filters.program) {
    parts.push(`program is ${filters.program}`);
  }

  if (filters.awardType) {
    parts.push(`award type is ${filters.awardType}`);
  }

  if (filters.phaseType) {
    parts.push(`phase type is ${filters.phaseType}`);
  }

  if (filters.state) {
    parts.push(`state is ${filters.state}`);
  }

  if (filters.minYear !== null && filters.maxYear !== null) {
    parts.push(`start year is between ${filters.minYear} and ${filters.maxYear}`);
  } else if (filters.minYear !== null) {
    parts.push(`start year is ${filters.minYear} or later`);
  } else if (filters.maxYear !== null) {
    parts.push(`start year is ${filters.maxYear} or earlier`);
  }

  if (filters.minAward !== null) {
    parts.push(`award amount is at least ${safeMoney(filters.minAward)}`);
  }

  if (!parts.length) {
    return "No active filters (showing all records).";
  }

  return `Current filters: ${parts.join("; ")}.`;
}

function renderFilterSummaries(filters) {
  const summary = buildHumanReadableFilterSummary(filters);
  ui.companiesFilterSummary.textContent = summary;
  ui.contractsFilterSummary.textContent = summary;
}

function aggregateCompanies(contracts) {
  const index = new Map();

  contracts.forEach((contract) => {
    const key = contract.normalizedCompanyName || contract.companyName;

    if (!index.has(key)) {
      index.set(key, {
        companyName: contract.companyName,
        contractCount: 0,
        totalAward: 0,
        totalObligation: 0
      });
    }

    const item = index.get(key);
    item.contractCount += 1;
    item.totalAward += Number(contract.awardAmount || 0);
    item.totalObligation += Number(contract.currentObligationAmount || 0);
  });

  return Array.from(index.values()).sort((a, b) => b.totalAward - a.totalAward);
}

function aggregateStates(contracts) {
  const index = new Map();

  contracts.forEach((contract) => {
    const code = contract.companyStateCd;
    if (!code) {
      return;
    }

    if (!index.has(code)) {
      index.set(code, {
        stateCode: code,
        stateName: contract.companyState,
        contractCount: 0,
        totalAward: 0,
        totalObligation: 0
      });
    }

    const item = index.get(code);
    item.contractCount += 1;
    item.totalAward += Number(contract.awardAmount || 0);
    item.totalObligation += Number(contract.currentObligationAmount || 0);
  });

  return Array.from(index.values()).sort((a, b) => b.totalAward - a.totalAward);
}

function renderMetrics(filteredContracts, companies, states) {
  const totalAward = filteredContracts.reduce((sum, item) => sum + Number(item.awardAmount || 0), 0);
  const totalObligation = filteredContracts.reduce((sum, item) => sum + Number(item.currentObligationAmount || 0), 0);

  const metrics = [
    { label: "Filtered Contracts", value: safeNumber(filteredContracts.length) },
    { label: "Filtered Companies", value: safeNumber(companies.length) },
    { label: "Total Award", value: safeMoney(totalAward) },
    { label: "Total Obligation", value: safeMoney(totalObligation) },
    { label: "States with Data", value: safeNumber(states.length) },
    {
      label: "Raw Contracts Rows",
      value: appState.summaryMetrics ? safeNumber(appState.summaryMetrics.contracts_rows) : "-"
    },
    {
      label: "Raw Contractors Rows",
      value: appState.summaryMetrics ? safeNumber(appState.summaryMetrics.contractors_rows) : "-"
    },
    {
      label: "Unique Contract Companies",
      value: appState.summaryMetrics ? safeNumber(appState.summaryMetrics.unique_contract_companies) : "-"
    }
  ];

  ui.metricsPanel.innerHTML = metrics
    .map(
      (metric) =>
        `<article class="metric"><div class="label">${metric.label}</div><div class="value">${metric.value}</div></article>`
    )
    .join("");
}

function renderCompaniesTable(companies) {
  const sortedCompanies = sortRows(companies, "companies");
  const rows = sortedCompanies.map(
    (company) => `
      <tr>
        <td><button class="link-button" type="button" data-open-company="${escapeHtml(
          normalizeCompanyName(company.companyName)
        )}">${escapeHtml(company.companyName)}</button></td>
        <td>${safeNumber(company.contractCount)}</td>
        <td>${safeMoney(company.totalAward)}</td>
        <td>${safeMoney(company.totalObligation)}</td>
      </tr>
    `
  );

  ui.companiesTableBody.innerHTML = rows.join("") || '<tr><td colspan="4">No matches.</td></tr>';
}

function renderContractsTable(contracts) {
  const sortedContracts = sortRows(contracts, "contracts");
  const rows = sortedContracts.slice(0, 250).map(
    (contract) => `
      <tr>
        <td><button class="link-button" type="button" data-open-contract="${escapeHtml(contract.awardId)}">${escapeHtml(
          contract.awardId
        )}</button></td>
        <td><button class="link-button" type="button" data-open-company="${escapeHtml(
          contract.normalizedCompanyName || normalizeCompanyName(contract.companyName)
        )}">${escapeHtml(contract.companyName)}</button></td>
        <td>${contract.programName || ""}</td>
        <td>${contract.phaseTypeDesc || contract.phaseType || ""}</td>
        <td>${contract.awardTypeDesc || contract.awardType || ""}</td>
        <td>${contract.popStartDate || ""}</td>
        <td>${contract.popEndDate || ""}</td>
        <td>${safeMoney(contract.awardAmount)}</td>
        <td>${contract.companyStateCd || ""}</td>
      </tr>
    `
  );

  ui.contractsTableBody.innerHTML = rows.join("") || '<tr><td colspan="9">No matches.</td></tr>';
}

function renderMap(stateRows) {
  appState.mapLayerGroup.clearLayers();

  const maxAward = Math.max(...stateRows.map((item) => Number(item.totalAward || 0)), 1);

  stateRows.forEach((state) => {
    const code = state.stateCode;
    const center = stateCentroids[code];
    if (!center) {
      return;
    }

    const amount = Number(state.totalAward || 0);
    const radius = 5 + (Math.sqrt(amount / maxAward) * 30);

    const marker = L.circleMarker(center, {
      radius,
      weight: 1,
      color: "#1d4ed8",
      fillColor: "#3b82f6",
      fillOpacity: 0.35
    });

    marker.bindPopup(
      `<strong>${code}${state.stateName ? ` — ${state.stateName}` : ""}</strong><br/>` +
        `Contracts: ${safeNumber(state.contractCount)}<br/>` +
        `Total Award: ${compactMoney(amount)}<br/>` +
        `Total Obligation: ${compactMoney(state.totalObligation || 0)}`
    );

    marker.on("click", () => {
      ui.stateFilter.value = ui.stateFilter.value === code ? "" : code;
      render();
    });

    marker.addTo(appState.mapLayerGroup);
  });
}

function render() {
  syncQueryFromFilterInputs();

  const filters = getFilterValues();
  const filteredContracts = appState.contracts.filter((contract) => contractMatches(contract, filters));
  const companies = aggregateCompanies(filteredContracts);
  const states = aggregateStates(filteredContracts);

  renderMetrics(filteredContracts, companies, states);
  renderFilterSummaries(filters);
  renderCompaniesTable(companies);
  renderContractsTable(filteredContracts);
  renderMap(states);
  updateSortHeaderIndicators();
  renderDetailModal();
}

function wireEvents() {
  [
    ui.searchInput,
    ui.programFilter,
    ui.awardTypeFilter,
    ui.phaseTypeFilter,
    ui.stateFilter,
    ui.minYearFilter,
    ui.maxYearFilter,
    ui.minAwardFilter
  ].forEach((element) => {
    const eventType = element.tagName === "INPUT" && element.type === "search" ? "input" : "change";
    element.addEventListener(eventType, render);
  });

  ui.minYearFilter.addEventListener("input", render);
  ui.maxYearFilter.addEventListener("input", render);
  ui.minAwardFilter.addEventListener("input", render);

  ui.companiesTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-company]");
    if (!button) {
      return;
    }

    const companyKey = button.getAttribute("data-open-company");
    openCompanyModalByKey(companyKey);
  });

  ui.contractsTableBody.addEventListener("click", (event) => {
    const contractButton = event.target.closest("[data-open-contract]");
    if (contractButton) {
      openContractModalByAwardId(contractButton.getAttribute("data-open-contract"));
      return;
    }

    const companyButton = event.target.closest("[data-open-company]");
    if (companyButton) {
      openCompanyModalByKey(companyButton.getAttribute("data-open-company"));
    }
  });

  ui.detailModalBody.addEventListener("click", (event) => {
    const contractButton = event.target.closest("[data-open-contract]");
    if (contractButton) {
      openContractModalByAwardId(contractButton.getAttribute("data-open-contract"));
      return;
    }

    const companyButton = event.target.closest("[data-open-company]");
    if (companyButton) {
      openCompanyModalByKey(companyButton.getAttribute("data-open-company"));
    }
  });

  ui.closeModalBtn.addEventListener("click", closeDetailModal);
  ui.detailModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal='true']")) {
      closeDetailModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && appState.modal.type) {
      closeDetailModal();
    }
  });

  ui.resetFiltersBtn.addEventListener("click", () => {
    ui.searchInput.value = "";
    ui.programFilter.value = "";
    ui.awardTypeFilter.value = "";
    ui.phaseTypeFilter.value = "";
    ui.stateFilter.value = "";
    ui.minYearFilter.value = "";
    ui.maxYearFilter.value = "";
    ui.minAwardFilter.value = "";
    render();
  });

  window.addEventListener("popstate", () => {
    applyFilterInputsFromQuery();
    render();
  });
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function initFiltersFromData(contracts) {
  populateSelect(ui.programFilter, [...new Set(contracts.map((item) => item.programName))]);
  populateSelect(ui.awardTypeFilter, [...new Set(contracts.map((item) => item.awardType))]);
  populateSelect(ui.phaseTypeFilter, [...new Set(contracts.map((item) => item.phaseType))]);
  populateSelect(ui.stateFilter, [...new Set(contracts.map((item) => item.companyStateCd))]);

  const years = contracts
    .map((item) => Number(item.popStartYear))
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => a - b);

  if (years.length) {
    ui.minYearFilter.min = String(years[0]);
    ui.minYearFilter.max = String(years[years.length - 1]);
    ui.maxYearFilter.min = String(years[0]);
    ui.maxYearFilter.max = String(years[years.length - 1]);
  }
}

async function init() {
  try {
    const [contracts, summaryMetrics] = await Promise.all([
      loadJson("./data/contracts_enriched.json"),
      loadJson("./data/summary_metrics.json")
    ]);

    appState.contracts = contracts;
    appState.summaryMetrics = summaryMetrics;

    initFiltersFromData(contracts);
    applyFilterInputsFromQuery();
    initializeSortableHeaders();
    initMap();
    wireEvents();
    render();
  } catch (error) {
    ui.metricsPanel.innerHTML = `<div class="metric"><div class="label">Error</div><div class="value">${error.message}</div></div>`;
    console.error(error);
  }
}

init();