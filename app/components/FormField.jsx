const FormField = ({ label, value, onChange, type = "text", placeholder, rows, disabled = false }) => {
    return (
      <section>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {type === "textarea" ? (
          <textarea
            value={value}
            onChange={onChange}
            className={`mt-1 block w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500 ${disabled ? 'bg-gray-200 text-gray-400 border-gray-300' : 'border-gray-300'}`}
            rows={rows}
            placeholder={placeholder}
            required
            disabled={disabled}
          ></textarea>
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            className={`mt-1 block w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500 ${disabled ? 'bg-gray-200 text-gray-400 border-gray-300' : 'border-gray-300'}`}
            placeholder={placeholder}
            required
            disabled={disabled}
          />
        )}
      </section>
    );
  };
  
  export default FormField;
  