/**
 * SETUP DAN PEMELIHARAAN DATABASE WEB CSR
 *
 * File ini dijalankan manual dari Apps Script Editor / Console.
 * Fungsi-fungsi di sini idempotent dan tidak merusak data yang sudah ada.
 */

/** Migrasikan data lama SiLapak_Satpam ke tab gabungan SiLapak_Duty. */
function migrateSilapakDutySatpam_() {
  const ss = spreadsheet_();
  const dutySheet =
    ss.getSheetByName("SiLapak_Duty") || ss.insertSheet("SiLapak_Duty");
  const satpamSheet = ss.getSheetByName("SiLapak_Satpam");
  const targetHeaders = ["shift", "names", "submittedAt"];
  const today = dateOnlyWib_(new Date());

  let existingRows = [];
  if (dutySheet.getLastRow() >= 2) {
    const values = dutySheet.getDataRange().getValues();
    const headers = values[0].map(String);
    const idx = function (name) {
      return headers.indexOf(name);
    };

    if (idx("shift") >= 0 && idx("names") >= 0 && idx("submittedAt") >= 0) {
      // Sudah menggunakan schema baru. Jangan menulis ulang agar tanggal lama tetap utuh.
      existingRows = values
        .slice(1)
        .map(function (row) {
          return {
            shift: String(row[idx("shift")] || "").trim(),
            names: String(row[idx("names")] || "").trim(),
            submittedAt: String(row[idx("submittedAt")] || "").trim(),
          };
        })
        .filter(function (row) {
          return row.names;
        });
    } else {
      // Konversi schema lama: shift/names berada di A:B, sedangkan master satpam
      // lama berada di kolom value/order. Jika ada duty aktif, nama satpam lama
      // diberi shift aktif tersebut agar hasil migrasi langsung rapi.
      let activeShift = "";
      let dutyNames = [];
      const shiftIndex = idx("shift");
      const namesIndex = idx("names");
      const valueIndex = idx("value");
      const rows = values.slice(1);

      rows.forEach(function (row) {
        if (
          !activeShift &&
          shiftIndex >= 0 &&
          String(row[shiftIndex] || "").trim()
        ) {
          activeShift = String(row[shiftIndex]).trim();
        }
        if (namesIndex >= 0 && String(row[namesIndex] || "").trim()) {
          const decoded = decodeCell_(row[namesIndex]);
          if (Array.isArray(decoded))
            dutyNames = dutyNames.concat(decoded.map(String));
          else dutyNames.push(String(decoded));
        }
      });

      const dutySet = {};
      dutyNames.forEach(function (name) {
        dutySet[String(name).trim().toLowerCase()] = true;
      });

      rows.forEach(function (row) {
        if (valueIndex >= 0 && String(row[valueIndex] || "").trim()) {
          const name = String(row[valueIndex]).trim();
          existingRows.push({
            shift: dutySet[name.toLowerCase()]
              ? activeShift
              : activeShift || "",
            names: name,
            submittedAt: today,
          });
        }
      });

      dutyNames.forEach(function (name) {
        const clean = String(name || "").trim();
        if (
          clean &&
          !existingRows.some(function (r) {
            return r.names.toLowerCase() === clean.toLowerCase();
          })
        ) {
          existingRows.push({
            shift: activeShift,
            names: clean,
            submittedAt: today,
          });
        }
      });
    }
  }

  // Satpam dari tab lama juga dipindahkan ke kolom names.
  if (satpamSheet && satpamSheet.getLastRow() >= 2) {
    const values = satpamSheet.getDataRange().getValues();
    const headers = values[0].map(String);
    const valueIndex = headers.indexOf("value");
    values.slice(1).forEach(function (row) {
      const name = String(row[valueIndex >= 0 ? valueIndex : 0] || "").trim();
      if (
        name &&
        !existingRows.some(function (r) {
          return r.names.toLowerCase() === name.toLowerCase();
        })
      ) {
        existingRows.push({ shift: "", names: name, submittedAt: today });
      }
    });
  }

  const plan = tablePlan_("SiLapak_Duty", existingRows);
  writeNative_(dutySheet, plan.values);
  SpreadsheetApp.flush();

  if (satpamSheet) ss.deleteSheet(satpamSheet);
}

/** Inisialisasi tab dan header yang belum ada di Spreadsheet. */
function setupDatabase() {
  return withLock_(function () {
    if (
      PropertiesService.getScriptProperties().getProperty(
        "DB_WRITE_RECOVERY_REQUIRED",
      )
    ) {
      fail_(
        "RECOVERY_REQUIRED",
        "Pulihkan penulisan yang terputus sebelum setup.",
      );
    }
    const ss = spreadsheet_();
    migrateSilapakDutySatpam_();
    allSheetNames_().forEach(function (name) {
      const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
      if (sheet.getLastRow() === 0) {
        const headers = initialHeaders_(name);
        ensureGrid_(sheet, 1, headers.length);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.setFrozenRows(1);
      }
    });
    SpreadsheetApp.flush();
    clearSpreadsheetCache_();
    PropertiesService.getScriptProperties().setProperty(
      "DB_VERSION",
      DB_VERSION,
    );
    return databaseHealth_(true);
  });
}

/** Simpan target spreadsheet ID secara kustom. */
function setSpreadsheetId(id) {
  id = String(id || "").trim();
  if (!id) fail_("VALIDATION", "Spreadsheet ID wajib diisi.");
  SpreadsheetApp.openById(id);
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", id);
  clearSpreadsheetCache_();
  return databaseHealth_(true);
}

/** Menggunakan kembali Spreadsheet lama yang sudah dipilih sebagai database. */
function useLatestSpreadsheet() {
  return setSpreadsheetId("1m8Xd_eXMzudvDrqfSme8rfIE6RiIA1MRoId9bwZVopg");
}

/** Arahkan Web App ke Spreadsheet lama lalu buat header pada tab yang kosong. */
function gunakanSpreadsheetLama() {
  setSpreadsheetId("1m8Xd_eXMzudvDrqfSme8rfIE6RiIA1MRoId9bwZVopg");
  return setupDatabase();
}

/** Alias kompatibilitas untuk deployment lama. Tidak membuat Spreadsheet baru. */
function gunakanSpreadsheetBaru() {
  return gunakanSpreadsheetLama();
}

/**
 * Bersihkan seluruh tab agar hanya menyisakan kolom schema + field yang
 * benar-benar berisi data frontend. Backup Spreadsheet dibuat lebih dahulu.
 */
function cleanupDatabaseSchema() {
  return withLock_(function () {
    prefetch_(allSheetNames_().concat(["BAPP"]));
    const plans = [];
    let sharedSilapakPlanned = false;
    Object.keys(DATASETS).forEach(function (key) {
      if (DATASETS[key].sharedSilapak) {
        if (sharedSilapakPlanned) return;
        sharedSilapakPlanned = true;
        plans.push(
          planSilapakShared_(
            readSilapakDutyShared_(),
            readSilapakSatpamShared_(),
          ),
        );
        return;
      }
      const value = readDataset_(DATASETS[key]);
      Array.prototype.push.apply(plans, planDataset_(DATASETS[key], value));
    });
    const stamp = new Date().toISOString();
    const backup = DriveApp.getFileById(spreadsheet_().getId()).makeCopy(
      "BACKUP_CSR_before_schema_cleanup_" + stamp.replace(/[:.]/g, "-"),
    );
    commitPlans_(plans);
    return {
      ok: true,
      spreadsheetId: spreadsheet_().getId(),
      cleanedSheets: plans.map(function (plan) {
        return plan.name;
      }),
      backupUrl: backup.getUrl(),
    };
  });
}

/** Nama yang lebih jelas untuk merapikan kolom tanpa menghapus data pengguna. */
function rapikanKolomDatabase() {
  return cleanupDatabaseSchema();
}

/**
 * Hapus hanya record demo bawaan versi lama. Record lain milik pengguna tetap
 * dipertahankan. Backup Spreadsheet dibuat sebelum perubahan dijalankan.
 */
function hapusDataContoh() {
  return withLock_(function () {
    const packageTitles = [
      "Bantuan Perbaikan Jalan Metro Marina Ancol",
      "Fasilitasi Kegiatan Sinergi Kota Hijau",
      "Bantuan Rehabilitasi Mangrove Cilincing",
    ];
    const proposalTitles = [
      "Rehabilitasi Mangrove Muara Angke Tahap 2",
      "Beasiswa & Sarana Belajar 30 Siswa Berprestasi",
    ];
    const mitraTitles = [
      "Rehabilitasi Mangrove Muara Angke Tahap 2",
      "Beasiswa dan Sarana Belajar 30 Siswa Berprestasi",
    ];
    const kontenTitles = [
      "PLN IP UBP Priok Salurkan Bantuan Rehabilitasi Mangrove",
      "Dokumentasi Penyerahan Beasiswa SDN Rawa Badak 05",
    ];
    const vendorNames = ["CV Cahaya Abadi", "PT Sumber Makmur"];

    const recordTitle = function (row) {
      return String(row.judulKegiatan || row.judulBantuan || row.judul || "");
    };
    const filters = {
      rab: function (row) {
        return packageTitles.indexOf(recordTitle(row)) < 0;
      },
      tor: function (row) {
        return packageTitles.indexOf(recordTitle(row)) < 0;
      },
      bast: function (row) {
        return packageTitles.indexOf(recordTitle(row)) < 0;
      },
      pakta: function (row) {
        return packageTitles.indexOf(recordTitle(row)) < 0;
      },
      packages: function (row) {
        return packageTitles.indexOf(recordTitle(row)) < 0;
      },
      vendors: function (row) {
        return vendorNames.indexOf(String(row.nama || "")) < 0;
      },
      proposals: function (row) {
        return proposalTitles.indexOf(String(row.judulProposal || "")) < 0;
      },
      mitraList: function (row) {
        return mitraTitles.indexOf(String(row.judulPengajuan || "")) < 0;
      },
      konten: function (row) {
        return kontenTitles.indexOf(String(row.judul || "")) < 0;
      },
    };

    prefetch_(
      Object.keys(filters).reduce(function (names, key) {
        return names.concat(namesFor_(DATASETS[key]));
      }, []),
    );

    const plans = [];
    const removed = {};
    Object.keys(filters).forEach(function (key) {
      const before = readDataset_(DATASETS[key]);
      const after = before.filter(filters[key]);
      removed[key] = before.length - after.length;
      Array.prototype.push.apply(plans, planDataset_(DATASETS[key], after));
    });

    const stamp = new Date().toISOString();
    const backup = DriveApp.getFileById(spreadsheet_().getId()).makeCopy(
      "BACKUP_CSR_before_remove_demo_" + stamp.replace(/[:.]/g, "-"),
    );
    commitPlans_(plans);
    return {
      ok: true,
      spreadsheetId: spreadsheet_().getId(),
      removed: removed,
      backupUrl: backup.getUrl(),
    };
  });
}

/**
 * Kosongkan seluruh data transaksi yang pernah ditulis versi/demo sebelumnya.
 * Akun login, organisasi, dan pilihan master SAKTI tetap dipertahankan.
 * Daftar satpam ikut dikosongkan karena versi lama berisi nama contoh.
 *
 * Jalankan fungsi ini hanya ketika database memang belum dipakai untuk data
 * riil. Salinan backup dibuat otomatis sebelum satu baris pun dihapus.
 */
function kosongkanDataTransaksi() {
  return withLock_(function () {
    const preserved = {
      users: true,
      organizations: true,
      nonpoCombo: true,
      ccCombo: true,
      komunikasiNarasumberOptions: true,
    };
    const keys = Object.keys(DATASETS).filter(function (key) {
      return !preserved[key];
    });
    const sheetNames = keys.reduce(function (names, key) {
      return names.concat(namesFor_(DATASETS[key]));
    }, []);
    prefetch_(sheetNames.concat(["BAPP"]));

    const plans = [];
    const removed = {};
    let sharedSilapakCleared = false;
    keys.forEach(function (key) {
      const spec = DATASETS[key];
      const before = readDataset_(spec);
      removed[key] = Array.isArray(before)
        ? before.length
        : before && typeof before === "object"
          ? Object.keys(before).length
          : before == null
            ? 0
            : 1;

      if (spec.sharedSilapak) {
        if (!sharedSilapakCleared) {
          sharedSilapakCleared = true;
          plans.push(planSilapakShared_(null, []));
        }
        return;
      }

      const empty = spec.singleton
        ? null
        : spec.objectMap || spec.optionMap
          ? {}
          : [];
      Array.prototype.push.apply(plans, planDataset_(spec, empty));
    });

    const stamp = new Date().toISOString();
    const backup = DriveApp.getFileById(spreadsheet_().getId()).makeCopy(
      "BACKUP_CSR_before_clear_transactions_" + stamp.replace(/[:.]/g, "-"),
    );
    commitPlans_(plans);
    return {
      ok: true,
      spreadsheetId: spreadsheet_().getId(),
      preserved: Object.keys(preserved),
      removed: removed,
      backupUrl: backup.getUrl(),
    };
  });
}

/** Tes koneksi & kesehatan database. */
function testDatabaseConnection() {
  return databaseHealth_(true);
}

/** Laporan status pemulihan pasca kegagalan simpan/interupsi. */
function inspectRecoveryStatus() {
  return {
    recoveryRequired:
      PropertiesService.getScriptProperties().getProperty(
        "DB_WRITE_RECOVERY_REQUIRED",
      ) || null,
  };
}

/** Audit database read-only. */
function auditDatabase() {
  return withLock_(function () {
    prefetch_(allSheetNames_().concat(["BAPP"]));
    const datasets = {},
      errors = [];
    Object.keys(DATASETS).forEach(function (k) {
      try {
        inspectStoredChildren_(DATASETS[k]);
        const value = readDataset_(DATASETS[k]);
        validateDataset_(k, value);
        planDataset_(DATASETS[k], value);
        datasets[k] = Array.isArray(value)
          ? value.length
          : value === null
            ? 0
            : Object.keys(value).length;
      } catch (e) {
        errors.push({ dataset: k, error: e.message });
      }
    });
    return {
      ok: !errors.length,
      version: DB_VERSION,
      counts: datasets,
      errors: errors,
    };
  });
}

function collectUserCandidates_(value, output) {
  if (Array.isArray(value)) {
    value.forEach(function (item) {
      collectUserCandidates_(item, output);
    });
    return;
  }
  if (typeof value === "string" && /^[\s]*[\[{]/.test(value)) {
    try {
      collectUserCandidates_(JSON.parse(value), output);
    } catch (_) {}
    return;
  }
  if (!plain_(value)) return;
  if (
    value.id !== undefined &&
    value.username !== undefined &&
    value.role !== undefined
  )
    output.push(value);
  Object.keys(value).forEach(function (key) {
    const child = value[key];
    if (child && (typeof child === "object" || typeof child === "string"))
      collectUserCandidates_(child, output);
  });
}

/** Memperbaiki tab Users jika terjadi kerusakan header pada versi lama. */
function repairUsersSheetV4() {
  return withLock_(function () {
    const sheet = sheet_("Users", false);
    if (!sheet)
      fail_(
        "SETUP_REQUIRED",
        "Tab Users belum ada. Jalankan setupDatabase() dahulu.",
      );
    const values = sheet.getLastRow() ? sheet.getDataRange().getValues() : [];
    const candidates = [];
    if (values.length) {
      const headers = values[0].map(String);
      values.slice(1).forEach(function (row) {
        const flat = Object.create(null);
        headers.forEach(function (header, index) {
          if (
            !header ||
            row[index] === "" ||
            row[index] === null ||
            row[index] === undefined
          )
            return;
          const decoded = decodeCell_(row[index]);
          flat[header] = decoded;
          collectUserCandidates_(decoded, candidates);
        });
        try {
          collectUserCandidates_(unflatten_(flat), candidates);
        } catch (_) {}
      });
    }
    const allowed = SHEET_HEADERS.Users;
    const byId = new Map();
    candidates.forEach(function (candidate) {
      const clean = {};
      allowed.forEach(function (field) {
        if (own_(candidate, field) && candidate[field] !== undefined)
          clean[field] = candidate[field];
      });
      const id = String(clean.id || "").trim();
      if (!id) return;
      byId.set(id, Object.assign({}, byId.get(id) || {}, clean));
    });
    const users = Array.from(byId.values());
    if (!users.length)
      fail_(
        "REPAIR_EMPTY",
        "Tidak ditemukan akun valid untuk dipulihkan dari tab Users.",
      );
    validateDataset_("users", users);
    const stamp = new Date().toISOString();
    const backup = DriveApp.getFileById(spreadsheet_().getId()).makeCopy(
      "BACKUP_CSR_before_users_repair_" + stamp.replace(/[:.]/g, "-"),
    );
    commitPlans_([tablePlan_("Users", users)]);
    return {
      ok: true,
      version: DB_VERSION,
      schemaId: DB_SCHEMA_ID,
      repairedUsers: users.length,
      userIds: users.map(function (user) {
        return user.id;
      }),
      backupUrl: backup.getUrl(),
    };
  });
}

/** Migrasi skema database manual dengan backup otomatis. */
function migrateDatabaseV4() {
  setupDatabase();
  return withLock_(function () {
    prefetch_(allSheetNames_().concat(["BAPP"]));
    const plans = [],
      stamp = new Date().toISOString();
    Object.keys(DATASETS).forEach(function (k) {
      inspectStoredChildren_(DATASETS[k]);
      const value = readDataset_(DATASETS[k]);
      validateDataset_(k, value);
      Array.prototype.push.apply(plans, planDataset_(DATASETS[k], value));
    });
    plans.push(
      tablePlan_(META_SHEET, [
        { key: "schemaVersion", value: DB_VERSION, updatedAt: stamp },
      ]),
    );
    const backup = DriveApp.getFileById(spreadsheet_().getId()).makeCopy(
      "BACKUP_CSR_before_v4_" + stamp.replace(/[:.]/g, "-"),
    );
    commitPlans_(plans);
    return {
      ok: true,
      version: DB_VERSION,
      backupUrl: backup.getUrl(),
      migrated: Object.keys(DATASETS),
    };
  });
}

function inspectStoredChildren_(spec) {
  if (!spec.children) return;
  const parents = readTable_(spec.sheet),
    ids = new Set(
      parents.map(function (p) {
        return String(p[spec.key]);
      }),
    );
  spec.children.forEach(function (c) {
    const children = readTable_(c.sheet),
      counts = new Map();
    children.forEach(function (row) {
      const id = String(row[c.parent]);
      if (!ids.has(id))
        fail_(
          "MIGRATION_CONFLICT",
          c.sheet +
            ": baris tanpa induk " +
            id +
            "; perbaiki relasi sebelum migrasi.",
        );
      counts.set(id, (counts.get(id) || 0) + 1);
      if (c.singleton && counts.get(id) > 1)
        fail_("MIGRATION_CONFLICT", c.sheet + ": dokumen ganda untuk " + id);
    });
    parents.forEach(function (p) {
      if (
        p[c.field] &&
        Object.keys(p[c.field]).length &&
        counts.has(String(p[spec.key]))
      ) {
        fail_(
          "MIGRATION_CONFLICT",
          spec.sheet +
            ": data " +
            c.field +
            " ada di induk dan tab anak; tentukan versi benar sebelum migrasi.",
        );
      }
    });
  });
}
