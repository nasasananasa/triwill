
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "./supabaseClient";

export default function ClientsView() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  const [newClient, setNewClient] = useState({
    company_name: '',
    city: '',
    phone: '',
    email: '',
    contact_name: '',
    website: '',
    map_link: '',
    folder_link: '',
  });

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(newTheme === "dark");
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('company_name', { ascending: true });

    if (!error) setClients(data);
  };

const handleAddClient = async () => {
  alert("🚨 الدالة تشتغل فعلاً!");
    if (selectedClientId) {
      await handleUpdateClient();
      return;
    }

    const name = newClient.company_name.trim();
    if (!name) {
      alert('❗ اسم الشركة مطلوب.');
      return;
    }

    const isDuplicate = clients.some(
      (client) => client.company_name.trim().toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      alert('⚠️ هذه الشركة مضافة مسبقًا.');
      return;
    }

    const cleanedClient = Object.fromEntries(
      Object.entries(newClient).map(([key, value]) => [key, value.trim() || null])
    );

    const { data, error } = await supabase.from('clients').insert([cleanedClient]).select();

    console.log("✅ نتيجة الإضافة:", { data, error });

    if (error) {
      console.error('🔴 خطأ من Supabase:', error.message, error.details);
      alert(`❌ حدث خطأ أثناء الإضافة:\n${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      alert('⚠️ لم يتم حفظ البيانات في Supabase!');
      return;
    }

    alert('✅ تم إضافة العميل بنجاح.');

    setNewClient({
      company_name: '',
      city: '',
      phone: '',
      email: '',
      contact_name: '',
      website: '',
      map_link: '',
      folder_link: '',
    });

    fetchClients();
  };


  
  const handleEditClient = (client) => {
    setNewClient({
      company_name: client.company_name || '',
      city: client.city || '',
      phone: client.phone || '',
      email: client.email || '',
      contact_name: client.contact_name || '',
      website: client.website || '',
      map_link: client.map_link || '',
      folder_link: client.folder_link || '',
    });
    setSelectedClientId(client.id);
    setShowForm(true);
  };


  const toggleClientDetails = (id) => {
    setSelectedClientId(selectedClientId === id ? null : id);
  };

  
  

  const handleDeleteClient = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
      alert('🗑️ تم حذف العميل.');
      fetchClients();
    } else {
      alert('❌ فشل الحذف.');
    }
  };

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.company_name?.toLowerCase().includes(term) ||
        client.city?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  
  const handleUpdateClient = async () => {
    const name = newClient.company_name.trim();
    if (!name) {
      alert('❗ اسم الشركة مطلوب.');
      return;
    }

    const cleanedClient = Object.fromEntries(
      Object.entries(newClient).map(([key, value]) => [key, value.trim() || null])
    );

    const { error } = await supabase
      .from('clients')
      .update(cleanedClient)
      .eq('id', selectedClientId);

    if (error) {
      console.error('🔴 خطأ أثناء التعديل:', error.message);
      alert(`❌ حدث خطأ أثناء التعديل:\n${error.message}`);
    } else {
      alert('✅ تم تعديل العميل بنجاح.');
      setNewClient({
        company_name: '',
        city: '',
        phone: '',
        email: '',
        contact_name: '',
        website: '',
        map_link: '',
        folder_link: '',
      });
      setSelectedClientId(null);
      setShowForm(false);
      fetchClients();
    }
  };


  const styles = getStyles(isDarkMode);
  return (
    <div style={styles.container}>
      <style>{`
        @media (max-width: 768px) {
          .responsive-layout {
            flex-direction: column !important;
          }
        }
        .fade {
          transition: all 0.3s ease-in-out;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
        }
        .fade.show {
          max-height: 500px;
          opacity: 1;
        }
      `}</style>

      <button
        onClick={toggleDarkMode}
        style={{
          position: 'fixed',
          top: '15px',
          right: '15px',
          backgroundColor: 'transparent',
          color: isDarkMode ? '#fff' : '#000',
          fontSize: '24px',
          border: 'none',
          cursor: 'pointer',
          zIndex: 999,
        }}
        title={isDarkMode ? 'وضع النهار' : 'وضع الليل'}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          ...styles.addButton,
          marginBottom: '20px',
          maxWidth: '200px',
          marginInline: 'auto',
        }}
      >
        {showForm ? 'إخفاء النموذج' : '+ إضافة عميل'}
      </button>

      <div
        className="responsive-layout"
        style={{
          ...styles.innerContainer,
          justifyContent: showForm ? 'space-between' : 'center',
        }}
      >
        {showForm && (
          <div style={styles.formSection}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>إضافة عميل جديد</h2>
            {[
              { key: 'company_name', placeholder: 'اسم الشركة' },
              { key: 'contact_name', placeholder: 'الاسم الشخصي' },
              { key: 'city', placeholder: 'المدينة' },
              { key: 'phone', placeholder: 'رقم الهاتف' },
              { key: 'email', placeholder: 'الإيميل' },
              { key: 'website', placeholder: 'رابط الموقع' },
              { key: 'map_link', placeholder: 'رابط الخريطة' },
              { key: 'folder_link', placeholder: 'رابط المجلد' },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                type="text"
                placeholder={placeholder}
                value={newClient[key]}
                onChange={(e) => setNewClient({ ...newClient, [key]: e.target.value })}
                style={styles.input}
              />
            ))}
            <button onClick={handleAddClient} style={styles.addButton}>
              {selectedClientId ? '💾 حفظ التعديلات' : '✅ تأكيد الإضافة'}
            </button>
          </div>
        )}

        <div
          style={{
            ...styles.section,
            flex: 1,
            width: showForm ? '50%' : '100%',
            maxWidth: '100%',
          }}
        >
          <h1 style={styles.heading}>الزبائن</h1>

          <input
            type="text"
            placeholder="🔍 ابحث باسم الشركة أو المدينة"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...styles.input,
              marginBottom: '20px',
            }}
          />

          {filteredClients.map((client) => (
            <div key={client.id} style={{ marginBottom: '12px' }}>
              <button
                onClick={() => toggleClientDetails(client.id)}
                style={styles.clientButton}
              >
                {client.company_name}
              </button>

              <div className={`fade ${selectedClientId === client.id ? 'show' : ''}`}>
                <div style={styles.clientDetails}>
                  {client.contact_name && <div>الاسم: {client.contact_name}</div>}
                  {client.phone && (
                    <div>
                      الهاتف: {client.phone} <a href={`tel:${client.phone}`}>📞</a>
                    </div>
                  )}
                  {client.email && (
                    <div>
                      الإيميل: {client.email} <a href={`mailto:${client.email}`}>📧</a>
                    </div>
                  )}
                  {client.map_link && (
                    <div>
                      <a href={client.map_link} target="_blank" rel="noopener noreferrer">🗺️ خريطة</a>
                    </div>
                  )}
                  {client.website && (
                    <div>
                      <a href={client.website} target="_blank" rel="noopener noreferrer">🌐 موقع</a>
                    </div>
                  )}
                  {client.folder_link && (
                    <div>
                      <a href={client.folder_link} target="_blank" rel="noopener noreferrer">📁 مجلد</a>
                    </div>
                  )}

                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEditClient(client)} style={{ ...styles.smallButton }}>🖊️ تعديل</button>
                    <button onClick={() => navigate(`/activities/${client.id}`)} style={{ ...styles.smallButton, backgroundColor: "#17a2b8" }}>📋 متابعات</button>
                    <button onClick={() => handleDeleteClient(client.id)} style={{ ...styles.smallButton, backgroundColor: '#dc3545' }}>
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredClients.length === 0 && (
            <p style={{ color: isDarkMode ? '#aaa' : '#666', marginTop: '20px' }}>
              لا يوجد زبائن مطابقين للبحث.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getStyles(isDark) {
  return {
    container: {
      width: '100%',
      backgroundColor: isDark ? '#111' : '#f5f5f5',
      color: isDark ? 'white' : '#222',
      minHeight: '100vh',
      padding: '20px',
      margin: 0,
      overflowX: 'hidden',
      boxSizing: 'border-box',
      fontFamily: 'sans-serif',
      position: 'relative',
    },
    innerContainer: {
      display: 'flex',
      gap: '30px',
      alignItems: 'flex-start',
      width: '100%',
      flexWrap: 'wrap',
      boxSizing: 'border-box',
    },
    section: {
      textAlign: 'center',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
    },
    heading: {
      fontSize: '28px',
      marginBottom: '20px',
      color: isDark ? 'limegreen' : '#007bff',
    },
    clientButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: isDark ? '#222' : '#ffffff',
      border: `1px solid ${isDark ? '#555' : '#ccc'}`,
      borderRadius: '6px',
      color: isDark ? 'white' : '#333',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxSizing: 'border-box',
      boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
    },
    clientDetails: {
      fontSize: '14px',
      color: isDark ? '#ddd' : '#333',
      textAlign: 'right',
      padding: '10px',
      backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
      borderRadius: '6px',
      marginTop: '5px',
    },
    formSection: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '500px',
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '6px',
      border: `1px solid ${isDark ? '#444' : '#ccc'}`,
      backgroundColor: isDark ? '#222' : '#fff',
      color: isDark ? 'white' : '#222',
      direction: 'rtl',
      boxSizing: 'border-box',
    },
    addButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: isDark ? 'limegreen' : '#007bff',
      color: 'white',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
    smallButton: {
      padding: '6px 12px',
      fontSize: '14px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#6c757d',
      color: 'white',
    },
  };
}
