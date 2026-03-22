import { useState } from 'react'
import { Copy, Check, Search } from 'lucide-react'
import { SqlHighlight } from '../lib/sqlHighlight'

interface SqlExample { title: string; sql: string; desc?: string }
interface SqlSection { id: string; label: string; color: string; examples: SqlExample[] }

const SECTIONS: SqlSection[] = [
  {
    id: 'ddl', label: 'DDL', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    examples: [
      {
        title: 'CREATE TABLE',
        sql: `CREATE TABLE employees (
  id         INT           PRIMARY KEY IDENTITY(1,1),
  name       NVARCHAR(100) NOT NULL,
  email      VARCHAR(255)  UNIQUE,
  dept_id    INT           REFERENCES departments(id),
  salary     DECIMAL(10,2) DEFAULT 0,
  hired_at   DATE          NOT NULL,
  is_active  BIT           DEFAULT 1,
  created_at DATETIME2     DEFAULT GETDATE()
);`,
        desc: 'Define table structure with columns, types, constraints'
      },
      {
        title: 'ALTER TABLE',
        sql: `-- Add column
ALTER TABLE employees ADD phone VARCHAR(20);

-- Modify column type
ALTER TABLE employees ALTER COLUMN phone NVARCHAR(30);

-- Add constraint
ALTER TABLE employees ADD CONSTRAINT chk_salary CHECK (salary >= 0);

-- Drop column
ALTER TABLE employees DROP COLUMN phone;`,
      },
      {
        title: 'CREATE INDEX',
        sql: `-- Single column index
CREATE INDEX idx_emp_email ON employees(email);

-- Composite index
CREATE INDEX idx_emp_dept_salary ON employees(dept_id, salary DESC);

-- Unique index
CREATE UNIQUE INDEX idx_emp_email_unique ON employees(email);

-- Filtered index (SQL Server)
CREATE INDEX idx_active_emp ON employees(dept_id) WHERE is_active = 1;`,
      },
      {
        title: 'CREATE VIEW',
        sql: `CREATE VIEW active_employees AS
SELECT
  e.id,
  e.name,
  d.name AS department,
  e.salary
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE e.is_active = 1;

-- With CHECK OPTION
CREATE VIEW high_salary AS
SELECT * FROM employees WHERE salary > 50000
WITH CHECK OPTION;`,
      },
      {
        title: 'CREATE PROCEDURE',
        sql: `CREATE PROCEDURE GetEmployeesByDept
  @dept_id INT,
  @min_salary DECIMAL(10,2) = 0
AS
BEGIN
  SET NOCOUNT ON;
  SELECT id, name, salary
  FROM employees
  WHERE dept_id = @dept_id
    AND salary >= @min_salary
  ORDER BY salary DESC;
END;

-- Execute
EXEC GetEmployeesByDept @dept_id = 3, @min_salary = 50000;`,
      },
      {
        title: 'CREATE FUNCTION',
        sql: `-- Scalar function
CREATE FUNCTION dbo.GetFullName(@first NVARCHAR(50), @last NVARCHAR(50))
RETURNS NVARCHAR(101)
AS
BEGIN
  RETURN @first + ' ' + @last;
END;

-- Table-valued function
CREATE FUNCTION dbo.GetDeptEmployees(@dept_id INT)
RETURNS TABLE
AS
RETURN (
  SELECT id, name, salary
  FROM employees
  WHERE dept_id = @dept_id
);`,
      },
    ]
  },
  {
    id: 'select', label: 'SELECT', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    examples: [
      {
        title: 'Basic SELECT',
        sql: `-- All columns
SELECT * FROM employees;

-- Specific columns with alias
SELECT
  id,
  name AS employee_name,
  salary * 12 AS annual_salary
FROM employees;

-- DISTINCT
SELECT DISTINCT dept_id FROM employees;

-- TOP / LIMIT
SELECT TOP 10 * FROM employees ORDER BY salary DESC;
-- PostgreSQL/MySQL: SELECT * FROM employees ORDER BY salary DESC LIMIT 10;`,
      },
      {
        title: 'WHERE Clause',
        sql: `SELECT * FROM employees
WHERE dept_id = 3
  AND salary BETWEEN 40000 AND 80000
  AND name LIKE 'A%'
  AND email IS NOT NULL;

-- IN / NOT IN
SELECT * FROM employees WHERE dept_id IN (1, 2, 5);

-- EXISTS
SELECT * FROM employees e
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.emp_id = e.id
);

-- CASE in WHERE
SELECT * FROM employees
WHERE CASE WHEN salary > 50000 THEN 'high' ELSE 'low' END = 'high';`,
      },
      {
        title: 'JOINs',
        sql: `-- INNER JOIN
SELECT e.name, d.name AS dept
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- LEFT JOIN (keep all employees even without dept)
SELECT e.name, d.name AS dept
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- Multiple JOINs
SELECT e.name, d.name, l.city
FROM employees e
JOIN departments d ON e.dept_id = d.id
JOIN locations l ON d.location_id = l.id;

-- SELF JOIN
SELECT a.name AS employee, b.name AS manager
FROM employees a
LEFT JOIN employees b ON a.manager_id = b.id;`,
      },
      {
        title: 'GROUP BY & Aggregates',
        sql: `SELECT
  dept_id,
  COUNT(*)            AS headcount,
  AVG(salary)         AS avg_salary,
  MAX(salary)         AS max_salary,
  MIN(salary)         AS min_salary,
  SUM(salary)         AS total_salary
FROM employees
WHERE is_active = 1
GROUP BY dept_id
HAVING COUNT(*) > 5
ORDER BY avg_salary DESC;`,
      },
      {
        title: 'Subqueries',
        sql: `-- Scalar subquery
SELECT name, salary,
  (SELECT AVG(salary) FROM employees) AS avg_salary
FROM employees;

-- IN subquery
SELECT * FROM employees
WHERE dept_id IN (
  SELECT id FROM departments WHERE name LIKE 'Eng%'
);

-- Correlated subquery
SELECT e.*
FROM employees e
WHERE salary > (
  SELECT AVG(salary) FROM employees e2
  WHERE e2.dept_id = e.dept_id
);`,
      },
      {
        title: 'CTEs (WITH)',
        sql: `-- Simple CTE
WITH dept_stats AS (
  SELECT dept_id, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY dept_id
)
SELECT e.name, e.salary, ds.avg_sal
FROM employees e
JOIN dept_stats ds ON e.dept_id = ds.dept_id
WHERE e.salary > ds.avg_sal;

-- Recursive CTE (hierarchy)
WITH RECURSIVE org_tree AS (
  SELECT id, name, manager_id, 0 AS level
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, ot.level + 1
  FROM employees e
  JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT * FROM org_tree ORDER BY level, name;`,
      },
      {
        title: 'Window Functions',
        sql: `SELECT
  name,
  dept_id,
  salary,
  -- Ranking
  ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS row_num,
  RANK()       OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank,
  DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dense_rank,
  -- Aggregates over window
  AVG(salary)  OVER (PARTITION BY dept_id)             AS dept_avg,
  SUM(salary)  OVER (ORDER BY hired_at ROWS UNBOUNDED PRECEDING) AS running_total,
  -- Lead/Lag
  LAG(salary, 1) OVER (PARTITION BY dept_id ORDER BY hired_at) AS prev_salary,
  LEAD(salary,1) OVER (PARTITION BY dept_id ORDER BY hired_at) AS next_salary
FROM employees;`,
      },
      {
        title: 'PIVOT / UNPIVOT',
        sql: `-- PIVOT (SQL Server)
SELECT dept_id, [2021], [2022], [2023]
FROM (
  SELECT dept_id, YEAR(hired_at) AS yr, salary FROM employees
) AS src
PIVOT (
  AVG(salary) FOR yr IN ([2021],[2022],[2023])
) AS pvt;

-- Conditional aggregation (cross-database PIVOT)
SELECT dept_id,
  AVG(CASE WHEN YEAR(hired_at) = 2021 THEN salary END) AS [2021],
  AVG(CASE WHEN YEAR(hired_at) = 2022 THEN salary END) AS [2022],
  AVG(CASE WHEN YEAR(hired_at) = 2023 THEN salary END) AS [2023]
FROM employees
GROUP BY dept_id;`,
      },
    ]
  },
  {
    id: 'dml', label: 'DML', color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    examples: [
      {
        title: 'INSERT',
        sql: `-- Single row
INSERT INTO employees (name, email, dept_id, salary, hired_at)
VALUES ('Alice Smith', 'alice@example.com', 3, 75000, '2024-01-15');

-- Multiple rows
INSERT INTO employees (name, dept_id, salary, hired_at)
VALUES
  ('Bob Jones',  2, 65000, '2024-02-01'),
  ('Carol Lee',  3, 80000, '2024-02-15'),
  ('Dan Brown',  1, 55000, '2024-03-01');

-- INSERT ... SELECT
INSERT INTO archived_employees
SELECT * FROM employees WHERE is_active = 0;`,
      },
      {
        title: 'UPDATE',
        sql: `-- Single update
UPDATE employees
SET salary = salary * 1.1,
    updated_at = GETDATE()
WHERE dept_id = 3 AND is_active = 1;

-- Update with JOIN (SQL Server)
UPDATE e
SET e.salary = e.salary * 1.05
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE d.name = 'Engineering';

-- UPDATE with subquery
UPDATE employees
SET dept_id = (SELECT id FROM departments WHERE name = 'HR')
WHERE email LIKE '%@hr.example.com';`,
      },
      {
        title: 'DELETE & TRUNCATE',
        sql: `-- DELETE with condition
DELETE FROM employees WHERE is_active = 0 AND hired_at < '2020-01-01';

-- DELETE with JOIN (SQL Server)
DELETE e
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE d.name = 'Dissolved';

-- TRUNCATE (removes all rows, no logging, faster)
TRUNCATE TABLE temp_staging;

-- Soft delete pattern
UPDATE employees
SET is_active = 0, deleted_at = GETDATE()
WHERE id = 42;`,
      },
      {
        title: 'MERGE (Upsert)',
        sql: `MERGE INTO employees AS target
USING (
  VALUES (1, 'Alice Updated', 80000),
         (99, 'New Employee', 60000)
) AS source(id, name, salary)
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET target.name = source.name,
             target.salary = source.salary
WHEN NOT MATCHED BY TARGET THEN
  INSERT (id, name, salary) VALUES (source.id, source.name, source.salary)
WHEN NOT MATCHED BY SOURCE THEN
  DELETE;`,
      },
    ]
  },
  {
    id: 'functions', label: 'Functions', color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    examples: [
      {
        title: 'String Functions',
        sql: `SELECT
  LEN('Hello World')          AS len,         -- 11
  UPPER('hello')              AS upper,        -- HELLO
  LOWER('HELLO')              AS lower,        -- hello
  LTRIM('  hello  ')          AS ltrim,        -- 'hello  '
  RTRIM('  hello  ')          AS rtrim,        -- '  hello'
  TRIM('  hello  ')           AS trim_both,    -- 'hello'
  LEFT('Hello', 3)            AS left_3,       -- Hel
  RIGHT('Hello', 3)           AS right_3,      -- llo
  SUBSTRING('Hello', 2, 3)   AS substr,        -- ell
  CHARINDEX('o','Hello')      AS find_o,        -- 5
  REPLACE('Hello','l','r')   AS replaced,      -- Herro
  CONCAT('Hello',' ','World') AS concat_str,   -- Hello World
  FORMAT(12345.6, 'N2')       AS formatted;    -- 12,345.60`,
      },
      {
        title: 'Date Functions',
        sql: `SELECT
  GETDATE()                          AS now,
  SYSDATETIMEOFFSET()                AS now_tz,
  YEAR(GETDATE())                    AS yr,
  MONTH(GETDATE())                   AS mo,
  DAY(GETDATE())                     AS dy,
  DATEPART(WEEK, GETDATE())          AS week_num,
  DATEADD(DAY, 30, GETDATE())        AS plus_30d,
  DATEADD(MONTH, -3, GETDATE())      AS minus_3mo,
  DATEDIFF(DAY, '2024-01-01', GETDATE()) AS days_since,
  FORMAT(GETDATE(), 'yyyy-MM-dd')    AS formatted,
  EOMONTH(GETDATE())                 AS end_of_month,
  DATEFROMPARTS(2024, 12, 25)        AS xmas;`,
      },
      {
        title: 'Numeric Functions',
        sql: `SELECT
  ABS(-42)          AS abs_val,    -- 42
  CEILING(4.1)      AS ceil,       -- 5
  FLOOR(4.9)        AS fl,         -- 4
  ROUND(4.567, 2)   AS rounded,    -- 4.57
  SQRT(16)          AS sqrt,       -- 4
  POWER(2, 10)      AS pow,        -- 1024
  LOG(100, 10)      AS log10,      -- 2
  PI()              AS pi,
  RAND()            AS random_0_1,
  SIGN(-5)          AS sign_neg,   -- -1
  NULLIF(0, 0)      AS null_if_0,  -- NULL
  COALESCE(NULL, NULL, 42) AS first_non_null;  -- 42`,
      },
      {
        title: 'Conditional (CASE / IIF)',
        sql: `-- Simple CASE
SELECT name,
  CASE dept_id
    WHEN 1 THEN 'Engineering'
    WHEN 2 THEN 'Marketing'
    WHEN 3 THEN 'Finance'
    ELSE 'Other'
  END AS dept_name
FROM employees;

-- Searched CASE
SELECT name, salary,
  CASE
    WHEN salary < 40000 THEN 'Entry'
    WHEN salary < 70000 THEN 'Mid'
    WHEN salary < 100000 THEN 'Senior'
    ELSE 'Executive'
  END AS level
FROM employees;

-- IIF (SQL Server shorthand)
SELECT name, IIF(is_active = 1, 'Active', 'Inactive') AS status
FROM employees;`,
      },
      {
        title: 'JSON Functions (SQL Server 2016+)',
        sql: `-- Parse JSON
SELECT
  JSON_VALUE('{"name":"Alice","age":30}', '$.name') AS name,
  JSON_VALUE('{"addr":{"city":"NYC"}}', '$.addr.city') AS city;

-- OPENJSON
SELECT * FROM OPENJSON('[{"id":1,"name":"A"},{"id":2,"name":"B"}]')
WITH (id INT, name NVARCHAR(50));

-- FOR JSON
SELECT id, name FROM employees FOR JSON PATH;
SELECT id, name FROM employees FOR JSON AUTO;

-- JSON_MODIFY
UPDATE employees
SET settings = JSON_MODIFY(settings, '$.theme', 'dark')
WHERE id = 1;`,
      },
    ]
  },
  {
    id: 'transactions', label: 'Transactions', color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    examples: [
      {
        title: 'BEGIN / COMMIT / ROLLBACK',
        sql: `BEGIN TRANSACTION;

BEGIN TRY
  UPDATE accounts SET balance = balance - 500 WHERE id = 1;
  UPDATE accounts SET balance = balance + 500 WHERE id = 2;

  IF @@ROWCOUNT = 0
    THROW 50001, 'Target account not found', 1;

  COMMIT TRANSACTION;
  PRINT 'Transfer succeeded';
END TRY
BEGIN CATCH
  ROLLBACK TRANSACTION;
  PRINT 'Error: ' + ERROR_MESSAGE();
  THROW; -- re-raise
END CATCH;`,
      },
      {
        title: 'Savepoints',
        sql: `BEGIN TRANSACTION;

INSERT INTO orders (customer_id, total) VALUES (1, 100);
SAVE TRANSACTION sp1;

INSERT INTO order_items (order_id, product_id) VALUES (SCOPE_IDENTITY(), 5);
-- If this fails, rollback to savepoint only
ROLLBACK TRANSACTION sp1;

-- Continue with other work
INSERT INTO orders (customer_id, total) VALUES (2, 200);

COMMIT TRANSACTION;`,
      },
      {
        title: 'Isolation Levels',
        sql: `-- Set isolation level for session
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;  -- default
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; -- dirty reads
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;     -- strictest
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;         -- MVCC (SQL Server)

-- Per-query hints (SQL Server)
SELECT * FROM employees WITH (NOLOCK);           -- READ UNCOMMITTED
SELECT * FROM employees WITH (UPDLOCK, ROWLOCK); -- lock for update`,
      },
    ]
  },
  {
    id: 'advanced', label: 'Advanced', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    examples: [
      {
        title: 'Temporary Tables',
        sql: `-- Local temp table (session-scoped)
CREATE TABLE #temp_results (
  id INT, name NVARCHAR(100), score DECIMAL(5,2)
);

INSERT INTO #temp_results
SELECT id, name, AVG(score) FROM quiz_results GROUP BY id, name;

SELECT * FROM #temp_results WHERE score > 80;
DROP TABLE #temp_results;

-- Table variable
DECLARE @summary TABLE (dept_id INT, headcount INT);
INSERT INTO @summary SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id;
SELECT * FROM @summary;`,
      },
      {
        title: 'Dynamic SQL',
        sql: `-- EXEC with string
DECLARE @table NVARCHAR(128) = 'employees';
DECLARE @sql NVARCHAR(MAX);

SET @sql = N'SELECT TOP 10 * FROM ' + QUOTENAME(@table) + N' ORDER BY id DESC';
EXEC sp_executesql @sql;

-- sp_executesql with parameters (safe, prevents injection)
SET @sql = N'SELECT * FROM employees WHERE dept_id = @dept';
EXEC sp_executesql @sql, N'@dept INT', @dept = 3;`,
      },
      {
        title: 'Triggers',
        sql: `-- AFTER INSERT trigger
CREATE TRIGGER trg_employee_audit
ON employees
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO audit_log (table_name, action, record_id, changed_at)
  SELECT 'employees',
    CASE WHEN EXISTS (SELECT 1 FROM deleted) THEN 'UPDATE' ELSE 'INSERT' END,
    id, GETDATE()
  FROM inserted;
END;

-- INSTEAD OF DELETE trigger
CREATE TRIGGER trg_soft_delete
ON employees
INSTEAD OF DELETE
AS
BEGIN
  UPDATE employees SET is_active = 0
  WHERE id IN (SELECT id FROM deleted);
END;`,
      },
      {
        title: 'Partitioning',
        sql: `-- Create partition function
CREATE PARTITION FUNCTION pf_monthly (DATE)
AS RANGE RIGHT FOR VALUES ('2024-02-01','2024-03-01','2024-04-01');

-- Create partition scheme
CREATE PARTITION SCHEME ps_monthly
AS PARTITION pf_monthly ALL TO ([PRIMARY]);

-- Create partitioned table
CREATE TABLE sales (
  id    INT NOT NULL,
  sale_date DATE NOT NULL,
  amount DECIMAL(10,2)
) ON ps_monthly(sale_date);`,
      },
      {
        title: 'Query Hints & Optimization',
        sql: `-- Force index
SELECT * FROM employees WITH (INDEX(idx_emp_dept_salary))
WHERE dept_id = 3;

-- Recompile
EXEC GetEmployeesByDept @dept_id = 1 WITH RECOMPILE;

-- MAXDOP
SELECT * FROM large_table OPTION (MAXDOP 4);

-- Hash join hint
SELECT e.*, d.name
FROM employees e
JOIN departments d ON e.dept_id = d.id
OPTION (HASH JOIN, MAXDOP 8);

-- NOEXPAND for indexed views
SELECT * FROM vw_dept_summary WITH (NOEXPAND);`,
      },
    ]
  },
]


function SqlBlock({ example, copied, onCopy }: { example: SqlExample; copied: boolean; onCopy: () => void }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-gray-700">
        <div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{example.title}</span>
          {example.desc && <span className="ml-2 text-[10px] text-gray-400">{example.desc}</span>}
        </div>
        <button onClick={onCopy} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-primary-600 transition-colors">
          {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
          Copy
        </button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto whitespace-pre bg-[#1e1e1e]">
        <SqlHighlight code={example.sql} />
      </pre>
    </div>
  )
}

export default function SqlSyntax() {
  const [activeSection, setActiveSection] = useState('select')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const section = SECTIONS.find(s => s.id === activeSection)

  const filteredExamples = search.trim()
    ? SECTIONS.flatMap(s => s.examples.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.sql.toLowerCase().includes(search.toLowerCase()) ||
        e.desc?.toLowerCase().includes(search.toLowerCase())
      ).map(e => ({ ...e, sectionId: s.id, sectionLabel: s.label }))
    )
    : []

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search SQL syntax..."
          className="tool-textarea pl-9 py-2.5 rounded-lg h-auto"
        />
      </div>

      {search.trim() ? (
        <div className="space-y-3">
          {filteredExamples.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">No results for "{search}"</p>
            : filteredExamples.map((e, i) => (
                <div key={i}>
                  <p className="text-[10px] text-gray-400 mb-1">{e.sectionLabel}</p>
                  <SqlBlock example={e} copied={copied === `${e.sectionId}-${i}`} onCopy={() => copy(e.sql, `${e.sectionId}-${i}`)} />
                </div>
              ))}
        </div>
      ) : (
        <>
          {/* Section tabs */}
          <div className="flex flex-wrap gap-1.5">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === s.id ? s.color + ' ring-1 ring-inset ring-current' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Examples */}
          {section && (
            <div className="space-y-3">
              {section.examples.map((e, i) => (
                <SqlBlock key={i} example={e}
                  copied={copied === `${section.id}-${i}`}
                  onCopy={() => copy(e.sql, `${section.id}-${i}`)} />
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-[11px] text-gray-400">Syntax primarily follows T-SQL (SQL Server) with PostgreSQL/MySQL notes where applicable</p>
    </div>
  )
}
