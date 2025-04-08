import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function ClientActivitiesView() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [clientName, setClientName] = useState("");
  const [newActivity, setNewActivity] = useState({
    activity_type: "",
    result: "",
    date: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const styles = getStyles(isDark);

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? "#111" : "#f5f5f5";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!clientId) return;
    fetchActivities();
    fetchClientName();
  }, [clientId]);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false });
    if (!error) setActivities(data);
  };

  const fetchClientName = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("company_name")
      .eq("id", clientId)
      .single();
    if (!error) setClientName(data.company_name);
  };

  const handleAddOrUpdate = async () => {
    if (!clientId) return alert("لم يتم تحديد الزبون، لا يمكن حفظ المتابعة.");
    if (!newActivity.activity_type || !newActivity.result || !newActivity.date) {
      return alert("يرجى تعبئة نوع المتابعة والنتيجة والتاريخ.");
    }
    const payload = { ...newActivity, client_id: clientId };
    const { error } = editingId
      ? await supabase.from("activities").update(payload).eq("id", editingId)
      : await supabase.from("activities").insert(payload);
    if (!error) {
      fetchActivities();
      setNewActivity({ activity_type: "", result: "", date: "", notes: "" });
      setEditingId(null);
    }
  };

  const handleEdit = (activity) => {
    setNewActivity({
      activity_type: activity.activity_type,
      result: activity.result,
      date: activity.date,
      notes: activity.notes,
    });
    setEditingId(activity.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف المتابعة؟")) return;
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (!error) fetchActivities();
  };

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setIsDark(newTheme === "dark");
  };

  return (
    <div style={{ ...styles.container, direction: "rtl" }}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>رجوع</button>
      <button onClick={toggleTheme} style={styles.themeToggle}>
        {isDark ? "🌞" : "🌙"}
      </button>
      <h2 style={{ ...styles.title, color: isDark ? "#0f0" : "green" }}>سجل المتابعات</h2>
      <h3 style={styles.subtitle}>{clientName}</h3>

      <div style={styles.formRow}>
        <input
          type="text"
          placeholder="نوع المتابعة"
          value={newActivity.activity_type}
          onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value })}
          style={styles.inputShort}
        />
        <input
          type="text"
          placeholder="النتيجة"
          value={newActivity.result}
          onChange={(e) => setNewActivity({ ...newActivity, result: e.target.value })}
          style={styles.inputShort}
        />
        <input
          type="date"
          value={newActivity.date}
          onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
          style={styles.inputShort}
        />
        <textarea
          placeholder="ملاحظات"
          value={newActivity.notes}
          onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
          style={styles.textarea}
        />
        <button onClick={handleAddOrUpdate} style={styles.addButton}>
          {editingId ? "💾 حفظ التعديلات" : "✔️ حفظ المتابعة"}
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>نوع</th>
            <th style={styles.th}>النتيجة</th>
            <th style={styles.th}>التاريخ</th>
            <th style={styles.thNotes}>ملاحظات</th>
            <th style={styles.th}>خيارات</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => (
            <tr key={a.id}>
              <td style={styles.td}>{a.activity_type}</td>
              <td style={styles.td}>{a.result}</td>
              <td style={styles.td}>{a.date}</td>
              <td style={styles.td}>{a.notes}</td>
              <td style={{ ...styles.td, display: "flex", gap: "8px" }}>
                <button onClick={() => handleEdit(a)} style={{ ...styles.smallButton, backgroundColor: isDark ? "#007bff" : "#cce5ff", color: isDark ? "#fff" : "#000" }}>🖊️</button>
                <button onClick={() => handleDelete(a.id)} style={{ ...styles.smallButton, backgroundColor: isDark ? "#cc0000" : "#ffcccc", color: isDark ? "#fff" : "#000" }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

function getStyles(isDark) {
  const textColor = isDark ? "#fff" : "#07f";
  const bgColor = isDark ? "#222" : "#eee";
  const inputBg = isDark ? "#333" : "#fff";
  const inputText = isDark ? "#fff" : "#000";

  return {
    container: {
      maxWidth: "100%",
      boxSizing: "border-box",
      padding: "20px",
      color: textColor,
    },
    title: {
      textAlign: "center",
      fontSize: "24px",
      marginBottom: "10px",
      color: textColor,
    },
    subtitle: {
      textAlign: "center",
      fontSize: "20px",
      marginBottom: "20px",
      color: textColor,
    },
    formRow: {
      display: "flex",
      flexWrap: "wrap",
      flexDirection: "row",
      justifyContent: "flex-start",
      gap: "10px",
      marginBottom: "20px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "10px",
      marginBottom: "20px",
    },
    inputShort: {
      flex: "1 1 120px",
      minWidth: "100px",
      width: "120px",
      height: "44px",
      padding: "8px",
      borderRadius: "6px",
      backgroundColor: inputBg,
      color: inputText,
      border: "1px solid #ccc",
    },
    textarea: {
      flex: "1 1 100%",
      flexGrow: 1,
      minHeight: "44px",
      padding: "8px",
      borderRadius: "6px",
      resize: "vertical",
      backgroundColor: inputBg,
      color: inputText,
      border: "1px solid #ccc",
    },
    addButton: {
      height: "44px",
      padding: "0 16px",
      backgroundColor: "limegreen",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      width: "120px",
      backgroundColor: bgColor,
      padding: "8px",
      textAlign: "center",
      color: "#07f",
    },
    thNotes: {
      backgroundColor: bgColor,
      padding: "8px",
      textAlign: "center",
      color: "#07f",
    },
    td: {
      padding: "8px",
      backgroundColor: bgColor,
      border: "1px solid #ccc",
      color: isDark ? "#fff" : "#000",
    },
    smallButton: {
      padding: "4px 8px",
      borderRadius: "4px",
      cursor: "pointer",
    },
    backButton: {
      position: "fixed",
      top: "10px",
      left: "10px",
      backgroundColor: isDark ? "green" : "blue",
      color: "white",
      padding: "8px 12px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    themeToggle: {
      position: "fixed",
      top: "10px",
      right: "10px",
      backgroundColor: "transparent",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
    },
  };
}
