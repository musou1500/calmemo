import {
  startOfMonth,
  endOfMonth,
  differenceInDays,
  startOfDay,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./App.module.css";

const startOfCalenderMonth = (date: Date) => {
  const d = startOfMonth(new Date(date));
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() - 1);
  }
  return d;
};

const endOfCalenderMonth = (date: Date) => {
  const d = endOfMonth(new Date(date));
  while (d.getDay() !== 0) {
    d.setDate(d.getDate() + 1);
  }
  return d;
};

const CalenderCol = ({
  date,
  today,
  memo,
  onChangeMemo,
}: {
  date: Date;
  today: Date;
  memo: string;
  onChangeMemo: (date: Date, memo: string) => void;
}) => {
  const isCurrentMonth = date.getMonth() === today.getMonth();
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeMemo(date, e.target.value);
    },
    [date, onChangeMemo]
  );
  return (
    <td
      className={[
        !!memo ? styles.colNotEmpty : "",
        !isCurrentMonth ? styles.colNotCurrentMonth : "",
      ].join(" ")}
    >
      <div className={styles.colInner}>
        <div className={styles.colDate}>{date.getDate()}</div>
        <textarea
          className={styles.colTextarea}
          value={memo}
          onChange={onChange}
        />
      </div>
    </td>
  );
};

const getMemoKey = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};

const formatMonthText = (date: Date) => {
  return format(date, "yyyy-MM");
};

function App() {
  const [today, setToday] = useState(startOfDay(new Date()));
  const start = startOfCalenderMonth(today);
  const end = endOfCalenderMonth(today);
  const dows = ["月", "火", "水", "木", "金", "土", "日"];
  const rowsCount = Math.ceil(differenceInDays(end, start) / 7);
  const [memo, setMemo] = useState<Record<string, string>>({});
  const onChangeMemo = useCallback(
    (date: Date, value: string) => {
      const newMemo = { ...memo, [getMemoKey(date)]: value };
      localStorage.setItem("memo", JSON.stringify(newMemo));
      setMemo(newMemo);
    },
    [memo]
  );

  const onChangeMonth: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.target.valueAsDate) {
        setToday(e.target.valueAsDate);
      }
    },
    []
  );

  const onNextMonth = useCallback(() => {
    setToday((today) => addMonths(today, 1));
  }, []);

  const onPreviousMonth = useCallback(() => {
    setToday((today) => subMonths(today, 1));
  }, []);

  const onGotoToday = useCallback(() => {
    setToday(() => startOfMonth(new Date()));
  }, []);

  const onPrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    const memo = localStorage.getItem("memo");
    if (memo) {
      setMemo(JSON.parse(memo));
    }
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <button className={styles.changeMonthButton} onClick={onPreviousMonth}>
          &lt;
        </button>
        <input
          className={styles.currentMonth}
          type="month"
          value={formatMonthText(today)}
          onChange={onChangeMonth}
        />
        <button className={styles.changeMonthButton} onClick={onNextMonth}>
          &gt;
        </button>

        <button className={styles.changeMonthButton} onClick={onGotoToday}>
          今日
        </button>

        <button className={styles.printButton} onClick={onPrint}>
          印刷
        </button>
      </header>
      <main className={styles.calenderArea}>
        <table className={styles.calender}>
          <thead>
            <tr>
              {dows.map((dow) => (
                <th key={dow}>{dow}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowsCount }).map((_, i) => (
              <tr key={i}>
                {dows.map((_dow, innerIdx) => {
                  const d = new Date(start);
                  d.setDate(d.getDate() + i * 7 + innerIdx);
                  return (
                    <CalenderCol
                      date={d}
                      today={today}
                      key={d.getTime()}
                      onChangeMemo={onChangeMemo}
                      memo={memo[getMemoKey(d)] || ""}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default App;
