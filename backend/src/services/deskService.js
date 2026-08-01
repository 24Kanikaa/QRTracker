class DeskService {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const [rows] = await this.db.query(`
            SELECT
                id,
                desk_name,
                location,
                description,
                qr_slug,
                display_order,
                icon,
                is_gate,
                active,
                created_at
            FROM desks
            ORDER BY display_order ASC
        `);

    return rows;
  }

  async create(data) {
    const {
      desk_name,
      location,
      description,
      qr_slug,
      display_order,
      icon,
      is_gate,
    } = data;

    const [result] = await this.db.query(
      `
            INSERT INTO desks
            (
                desk_name,
                location,
                description,
                qr_slug,
                display_order,
                icon,
                is_gate
            )
            VALUES (?,?,?,?,?,?,?)
            `,
      [
        desk_name,
        location,
        description,
        qr_slug,
        display_order,
        icon,
        is_gate || false,
      ],
    );

    return result.insertId;
  }

  async update(id, data) {
    const {
      desk_name,
      location,
      description,
      qr_slug,
      display_order,
      icon,
      is_gate,
      active,
    } = data;

    await this.db.query(
      `
            UPDATE desks
            SET
                desk_name=?,
                location=?,
                description=?,
                qr_slug=?,
                display_order=?,
                icon=?,
                is_gate=?,
                active=?
            WHERE id=?
            `,
      [
        desk_name,
        location,
        description,
        qr_slug,
        display_order,
        icon,
        is_gate,
        active,
        id,
      ],
    );
  }

  async delete(id) {
    await this.db.query("DELETE FROM desks WHERE id=?", [id]);
  }

  async toggleStatus(id, active) {
    await this.db.query(
      `
            UPDATE desks
            SET active=?
            WHERE id=?
            `,
      [active, id],
    );
  }

  async getReports(date) {
    const [rows] = await this.db.query(
      `
            SELECT
              d.id,
              d.desk_name AS name,
              d.location,

              COUNT(l.id) AS totalStudents,

              MAX(l.scan_time) AS lastScan,

              ROUND(
                  AVG(
                      TIMESTAMPDIFF(
                          SECOND,
                          s.arrival_date,
                          l.scan_time
                      )
                  )
              ) AS avgSeconds

          FROM desks d

          LEFT JOIN logs l
          ON l.desk_id=d.id

          LEFT JOIN students s
          ON s.id=l.student_id

          GROUP BY d.id

        ORDER BY d.display_order;
            `,
      [date, date, date, date],
    );

    return rows;
  }

  async getById(id) {
    const [rows] = await this.db.query(
      `
        SELECT *
        FROM desks
        WHERE id = ?
        `,
      [id],
    );

    return rows[0] || null;
  }

  async getSummary(date) {
    const [[deskStats]] = await this.db.query(`
        SELECT
            COUNT(*) AS totalDesks,
            SUM(active = TRUE) AS activeDesks
        FROM desks
    `);

    const [[studentStats]] = await this.db.query(
      `
    SELECT
        COUNT(*) AS expectedStudents,

        SUM(status IN ('ARRIVED','IN_PROGRESS')) AS processedStudents,

        SUM(status = 'COMPLETED') AS completedStudents

    FROM students
    WHERE expected_date = ?
`,
      [date],
    );

    const expectedStudents = Number(studentStats.expectedStudents || 0);

    const processedStudents = Number(studentStats.processedStudents || 0);

    const completedStudents = Number(studentStats.completedStudents || 0);

    const pendingStudents = Math.max(
      expectedStudents - processedStudents - completedStudents,
      0,
    );

    const [deskReports] = await this.db.query(
      `
        SELECT
            d.id,
            d.desk_name AS name,
            d.location,

            COUNT(s.id) AS processedStudents

        FROM desks d

        LEFT JOIN students s
            ON s.current_desk_id = d.id
            AND s.expected_date = ?

        GROUP BY
            d.id,
            d.desk_name,
            d.location,
            d.display_order

        ORDER BY d.display_order
    `,
      [date],
    );

    return {
      summary: {
        totalDesks: Number(deskStats.totalDesks || 0),

        activeDesks: Number(deskStats.activeDesks || 0),

        expectedStudents,

        processedStudents,

        completedStudents,

        pendingStudents,

        avgCompletion:
          expectedStudents > 0
            ? Math.round((completedStudents / expectedStudents) * 100)
            : 0,
      },

      deskReports: deskReports.map((d) => {
        const processed = Number(d.processedStudents || 0);
        const pending = Math.max(expectedStudents - processed, 0);

        return {
          id: d.id,

          name: d.name,

          location: d.location,

          expectedStudents,

          processedStudents: processed,

          pendingStudents: pending,

          completion:
            expectedStudents > 0
              ? Math.round((processed / expectedStudents) * 100)
              : 0,
        };
      }),
    };
  }
  async getDeskStudents(deskId) {
    // Get all students who completed this desk
    const [students] = await this.db.query(
      `
        SELECT
            s.id,
            CONCAT(
                s.first_name,
                ' ',
                COALESCE(s.last_name, '')
            ) AS name,
            s.roll_number,
            s.email,
            l.scan_time
        FROM logs l
        INNER JOIN students s
            ON s.id = l.student_id
        WHERE l.desk_id = ?
        ORDER BY l.scan_time DESC
        `,
      [deskId],
    );

    // Count + latest scan + average interval between scans
    const [stats] = await this.db.query(
      `
        SELECT
            COUNT(*) AS count,
            MAX(scan_time) AS last_scan,
            ROUND(
                AVG(
                    TIMESTAMPDIFF(
                        SECOND,
                        (
                            SELECT MAX(l2.scan_time)
                            FROM logs l2
                            WHERE l2.desk_id = l.desk_id
                              AND l2.scan_time < l.scan_time
                        ),
                        l.scan_time
                    )
                )
            ) AS avg_seconds
        FROM logs l
        WHERE l.desk_id = ?
        `,
      [deskId],
    );

    return {
      count: Number(stats[0].count || 0),
      lastScan: stats[0].last_scan,
      avgSeconds: Number(stats[0].avg_seconds || 0),
      students,
    };
  }
  /* ---------------- QR ---------------- */

  async getQR(id) {
    const [rows] = await this.db.query(
      `
        SELECT
            id,
            desk_name,
            qr_slug,
            location,
            active
        FROM desks
        WHERE id = ?
        `,
      [id],
    );

    if (!rows.length) {
      return null;
    }

    const desk = rows[0];

    return {
      id: desk.id,
      name: desk.desk_name,
      location: desk.location,
      slug: desk.qr_slug,
      active: desk.active,
      url: `${process.env.FRONTEND_URL}/scan/${desk.qr_slug}`,
    };
  }

  async getBySlug(slug) {
    const [rows] = await this.db.query(
      `
        SELECT
            id,
            desk_name,
            description,
            location,
            qr_slug,
            active,
            is_gate
        FROM desks
        WHERE qr_slug = ?
        LIMIT 1
        `,
      [slug],
    );

    return rows.length ? rows[0] : null;
  }

  async scanDesk(email, qr_slug) {
    // console.log("Email:", email);
    // console.log("QR Slug:", qr_slug);
    // Find student
    const [students] = await this.db.query(
      `
        SELECT id, email
        FROM students
        WHERE email = ?
        LIMIT 1
        `,
      [email],
    );

    if (!students.length) {
      throw new Error("Student not found.");
    }

    const student = students[0];

    // Find desk
    const [desks] = await this.db.query(
      `
        SELECT id, desk_name,is_gate
        FROM desks
        WHERE qr_slug = ?
        AND active = 1
        LIMIT 1
        `,
      [qr_slug],
    );

    if (!desks.length) {
      throw new Error("Invalid QR code.");
    }

    const desk = desks[0];

    // Check duplicate
    const [existing] = await this.db.query(
      `
        SELECT id
        FROM logs
        WHERE student_id = ?
        AND desk_id = ?
        LIMIT 1
        `,
      [student.id, desk.id],
    );

    if (existing.length) {
      throw new Error("This desk has already been completed.");
    }

    // Insert log
    await this.db.query(
  `
    INSERT INTO logs
    (
      student_id,
      desk_id,
      scan_time
    )
    VALUES (?, ?, NOW())
  `,
  [student.id, desk.id]
);


await this.db.query(
  `
    UPDATE students
    SET
      current_desk_id = ?,

      arrival_date =
        CASE
          WHEN arrival_date IS NULL
          THEN NOW()

          ELSE arrival_date
        END

  WHERE id = ?
  `,
  [
    desk.id,
    student.id
  ]
);
    return desk;
  }

  //for each student 
  async getJourney(email) {
    // Get student
    const [students] = await this.db.query(
      `
        SELECT
            id,
            first_name,
            last_name,
            email,
            roll_number,copeBuddy
        FROM students
        WHERE email = ?
        LIMIT 1
        `,
      [email],
    );

    if (!students.length) {
      throw new Error("Student not found.");
    }

    const student = students[0];

    // Get completed desk logs
    const [logs] = await this.db.query(
      `
        SELECT
            desk_id,
            scan_time
        FROM logs
        WHERE student_id = ?
        `,
      [student.id],
    );

    // Map completed desks
    const completedMap = {};

    logs.forEach((log) => {
      completedMap[log.desk_id] = log.scan_time;
    });

    // Get all active desks
    const [desks] = await this.db.query(
      `
        SELECT
            id,
            desk_name,
            location,
            description,
            qr_slug,
            icon,
            is_gate,
            display_order
        FROM desks
        WHERE active = TRUE
        ORDER BY display_order ASC, id ASC
        `,
    );

    // Build journey
    const journey = desks.map((desk) => ({
      id: desk.id,
      title: desk.desk_name,
      location: desk.location,
      description: desk.description,
      qr_slug: desk.qr_slug,
      icon: desk.icon,
      is_gate: Boolean(desk.is_gate),

      status: completedMap[desk.id] ? "completed" : "pending",

      time: completedMap[desk.id]
        ? new Date(completedMap[desk.id]).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    }));

    const completed = journey.filter((d) => d.status === "completed").length;

    return {
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name ?? ""}`.trim(),
        email: student.email,
        rollNo: student.roll_number,
        completed,
        total: journey.length,
        copeBuddy:student.copeBuddy
      },
      journey,
    };
  }

//for all student report
async getStudents(status = "ALL") {
  const [desks] = await this.db.query(`
    SELECT
      d.id,
      d.desk_name,
      COUNT(dci.id) AS total_item_count,
      COUNT(
          CASE
              WHEN dci.type <> 'text' THEN 1
          END
      ) AS countable_item_count
  FROM desks d
  LEFT JOIN desk_checklist_items dci
      ON dci.desk_id = d.id
      AND dci.active = TRUE
  WHERE d.active = TRUE
  GROUP BY
      d.id,
      d.desk_name,
      d.display_order
  ORDER BY d.display_order
  `);

  const totalDesks = desks.length;

  const [students] = await this.db.query(`
    SELECT
        s.id,
        s.roll_number,
        s.application_number,
        s.first_name,
        s.last_name,
        s.email,
        s.gender,
         s.copeBuddy,
        s.expected_date,
        s.arrival_date,
        DATE_FORMAT(s.expected_date, '%Y-%m-%d') AS expected_date_key,
        DATE_FORMAT(s.arrival_date, '%Y-%m-%d') AS arrival_date_key,
        CASE
            WHEN s.arrival_date IS NOT NULL
             AND DATE(s.arrival_date) <> s.expected_date
            THEN 1 ELSE 0
        END AS is_unexpected_arrival,
        s.status,
        s.remarks,
        d.desk_name AS current_desk
    FROM students s
    LEFT JOIN desks d
        ON d.id = s.current_desk_id
    ORDER BY s.first_name
  `);

  const [logs] = await this.db.query(`
    SELECT
        l.student_id,
        l.scan_time,
        d.id AS desk_id,
        d.desk_name
    FROM logs l
    INNER JOIN desks d
        ON d.id = l.desk_id
    ORDER BY l.scan_time
  `);

  const [checklistCounts] = await this.db.query(`
   SELECT
    dcl.student_id,
    dci.desk_id,
    COUNT(*) AS checked_count
FROM desk_checklist_logs dcl
INNER JOIN desk_checklist_items dci
    ON dci.id = dcl.checklist_item_id
WHERE dci.type <> 'text'
  AND dcl.checked IN ('1', 'true')
GROUP BY
    dcl.student_id,
    dci.desk_id;
  `);

  const logsMap = {};
  logs.forEach(log => {
    if (!logsMap[log.student_id]) logsMap[log.student_id] = {};
    logsMap[log.student_id][log.desk_name] = {
      status: "completed",
      time: log.scan_time,
    };
  });

  const checkedCountMap = {};
  checklistCounts.forEach(row => {
    if (!checkedCountMap[row.student_id]) checkedCountMap[row.student_id] = {};
    checkedCountMap[row.student_id][row.desk_id] = row.checked_count;
  });

  let result = students.map(student => {
    const studentLogs = logsMap[student.id] || {};
    const completedCount = Object.keys(studentLogs).length;
    const deskStatus = {};

    desks.forEach(desk => {
      const base = studentLogs[desk.desk_name] || { status: "pending", time: null };
      deskStatus[desk.desk_name] = {
        ...base,
        checkedCount: checkedCountMap[student.id]?.[desk.id] ?? 0,
        totalCount: desk.countable_item_count,
      };
    });

    return {
      id: student.id,
      rollNumber: student.roll_number,
      copeBuddy: student.copeBuddy,
      applicationNumber: student.application_number,
      name: `${student.first_name} ${student.last_name ?? ""}`.trim(),
      email: student.email,
      gender: student.gender,
      remarks: student.remarks,
      expectedDate: student.expected_date,
      arrivalDate: student.arrival_date,
      expectedDateKey: student.expected_date_key,
      arrivalDateKey: student.arrival_date_key,
      isUnexpectedArrival: Boolean(student.is_unexpected_arrival),
      currentDesk: student.current_desk,
      completedCount,
      totalDesks,
      desks: deskStatus,
    };
  });

  switch (status) {
    case "COMPLETED":
      result = result.filter(s => s.completedCount === totalDesks);
      break;
    case "IN_PROGRESS":
      result = result.filter(s => Boolean(s.arrivalDateKey) && s.completedCount < totalDesks);
      break;
    case "EXPECTED":
      result = result.filter(s => !s.arrivalDateKey);
      break;
    case "UNEXPECTED":
      result = result.filter(s => s.isUnexpectedArrival);
      break;
  }

  return {
    desks: desks.map(d => ({
      id: d.id,
      desk_name: d.desk_name,
      hasChecklist: d.total_item_count > 0,
    })),
    students: result,
  };
}

async getDeskChecklist(deskId) {

    const [rows] = await this.db.query(

        `
        SELECT

            id,
            desk_id,
            description,
            required,
            display_order

        FROM desk_checklist_items

        WHERE desk_id = ?
          AND active = 1

        ORDER BY display_order ASC
        `,

        [deskId]

    );

    return rows;

}
async getStudentChecklistLogs(studentId, deskId) {
    const [rows] = await this.db.query(
        `
         SELECT
          dci.id AS checklist_item_id,
          dci.desk_id,
          dci.description,
          dci.required,
          dci.display_order,
          dci.type,

          dcl.id AS log_id,
          dcl.checked,
          dcl.remarks,
          dcl.checked_at,
          dcl.checked_by,

          u.name AS checked_by_name

      FROM desk_checklist_items dci

      LEFT JOIN desk_checklist_logs dcl
          ON dcl.checklist_item_id = dci.id
        AND dcl.student_id = ?

      LEFT JOIN users u
          ON u.id = dcl.checked_by

      WHERE dci.desk_id = ?
        AND dci.active = 1

      ORDER BY dci.display_order ASC
        `,
        [studentId, deskId]
    );
    return rows;
}

async updateChecklistItem(studentId, deskId, checklistItemId, checked, userId) {
    const finalValue =
        checked !== null && checked !== undefined && String(checked).trim() !== ""
            ? String(checked).trim()
            : null;

    const [exists] = await this.db.query(
        `SELECT id FROM desk_checklist_logs WHERE student_id = ? AND checklist_item_id = ?`,
        [studentId, checklistItemId]
    );

    if (exists.length) {
        await this.db.query(
            `
            UPDATE desk_checklist_logs
            SET
                checked = ?,
                checked_by = ?,
                checked_at = NOW()
            WHERE student_id = ?
              AND checklist_item_id = ?
            `,
            [finalValue, userId, studentId, checklistItemId]
        );
    } else {
        await this.db.query(
            `
            INSERT INTO desk_checklist_logs
                (student_id, checklist_item_id, checked, checked_by, checked_at)
            VALUES (?, ?, ?, ?, NOW())
            `,
            [studentId, checklistItemId, finalValue, userId]
        );
    }
}

async exportReport(filters = {}) {

    const [students] = await this.db.query(
        `
        SELECT
            s.id,
            s.first_name,
            s.roll_number,
            s.application_number,
            s.email,
            s.gender,
            s.expected_date,
            s.arrival_date,
            s.remarks,

            d.id   AS current_desk_id,
            d.desk_name AS current_desk_name

        FROM students s

        LEFT JOIN desks d
            ON d.id = s.current_desk_id

        ORDER BY s.first_name
        `
    );

    const [desks] = await this.db.query(
        `
        SELECT
            id,
            desk_name,
            qr_slug,
            display_order
        FROM desks
        WHERE active = 1
        ORDER BY display_order
        `
    );

    const [checklistItems] = await this.db.query(
        `
        SELECT
            id,
            desk_id,
            description,
            type,
            required,
            display_order

        FROM desk_checklist_items

        WHERE active = 1

        ORDER BY
            desk_id,
            display_order
        `
    );


    const [checklistLogs] = await this.db.query(
        `
        SELECT

            dcl.student_id,

            dcl.checklist_item_id,

            dcl.checked,

            dcl.checked_at,

            dcl.checked_by,

            u.name AS checked_by_name

        FROM desk_checklist_logs dcl

        LEFT JOIN users u
            ON u.id = dcl.checked_by
        `
    );

    const [deskLogs] = await this.db.query(
        `
        SELECT

            sdl.student_id,

            sdl.desk_id,

            sdl.scan_time,

            d.desk_name

        FROM logs sdl

        INNER JOIN desks d
            ON d.id = sdl.desk_id

        ORDER BY
            sdl.student_id,
            sdl.scan_time
        `
    );



    return {

        students,

        desks,

        checklistItems,

        checklistLogs,

        deskLogs

    };

}
}


module.exports = DeskService;
