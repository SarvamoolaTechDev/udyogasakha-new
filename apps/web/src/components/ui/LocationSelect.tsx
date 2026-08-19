import React from 'react';

const INDIAN_CITIES = [
  // Metros
  'Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  // Tier 2
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Meerut', 'Rajkot',
  'Kalyan-Dombivali', 'Vasai-Virar', 'Surat', 'Faridabad', 'Srinagar', 'Aurangabad',
  'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore',
  'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota',
  'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Bareilly', 'Moradabad',
  'Mysuru', 'Kochi', 'Thiruvananthapuram', 'Bhubaneswar', 'Dehradun', 'Noida',
  'Gurugram', 'Mangaluru', 'Tiruchirappalli', 'Salem', 'Warangal', 'Guntur',
  'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Jalandhar',
  // Remote / Other options
  'Remote', 'Pan India', 'Other',
].sort((a, b) => {
  // Keep Remote, Pan India, Other at the end
  const specials = ['Remote', 'Pan India', 'Other'];
  if (specials.includes(a) && !specials.includes(b)) return 1;
  if (!specials.includes(a) && specials.includes(b)) return -1;
  return a.localeCompare(b);
});

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function LocationSelect({ value, onChange, placeholder = 'Select location', required, style, className = 'fi' }: LocationSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      className={className}
      style={style}
    >
      <option value="">{placeholder}</option>
      {INDIAN_CITIES.map(city => (
        <option key={city} value={city}>{city}</option>
      ))}
    </select>
  );
}

export { INDIAN_CITIES };
