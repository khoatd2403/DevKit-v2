import { useState, useMemo } from 'react'
import { ArrowRightLeft } from 'lucide-react'

type Category = {
  name: string
  units: { label: string; value: string; factor?: number }[]
  toBase?: (val: number, unit: string) => number
  fromBase?: (val: number, unit: string) => number
}

const CATEGORIES: Category[] = [
  {
    name: 'Length',
    units: [
      { label: 'Kilometer (km)', value: 'km', factor: 1000 },
      { label: 'Meter (m)', value: 'm', factor: 1 },
      { label: 'Centimeter (cm)', value: 'cm', factor: 0.01 },
      { label: 'Millimeter (mm)', value: 'mm', factor: 0.001 },
      { label: 'Micrometer (μm)', value: 'um', factor: 1e-6 },
      { label: 'Mile (mi)', value: 'mi', factor: 1609.344 },
      { label: 'Yard (yd)', value: 'yd', factor: 0.9144 },
      { label: 'Foot (ft)', value: 'ft', factor: 0.3048 },
      { label: 'Inch (in)', value: 'in', factor: 0.0254 },
      { label: 'Nautical Mile (nmi)', value: 'nmi', factor: 1852 },
      { label: 'Light Year (ly)', value: 'ly', factor: 9.461e15 },
    ],
  },
  {
    name: 'Weight / Mass',
    units: [
      { label: 'Tonne (t)', value: 't', factor: 1000 },
      { label: 'Kilogram (kg)', value: 'kg', factor: 1 },
      { label: 'Gram (g)', value: 'g', factor: 0.001 },
      { label: 'Milligram (mg)', value: 'mg', factor: 1e-6 },
      { label: 'Microgram (μg)', value: 'ug', factor: 1e-9 },
      { label: 'Pound (lb)', value: 'lb', factor: 0.45359237 },
      { label: 'Ounce (oz)', value: 'oz', factor: 0.028349523 },
      { label: 'Stone (st)', value: 'st', factor: 6.35029 },
      { label: 'US Ton (ton)', value: 'uston', factor: 907.185 },
      { label: 'Imperial Ton (long ton)', value: 'lton', factor: 1016.047 },
    ],
  },
  {
    name: 'Temperature',
    units: [
      { label: 'Celsius (°C)', value: 'C' },
      { label: 'Fahrenheit (°F)', value: 'F' },
      { label: 'Kelvin (K)', value: 'K' },
      { label: 'Rankine (°R)', value: 'R' },
    ],
    toBase: (val, unit) => {
      if (unit === 'C') return val
      if (unit === 'F') return (val - 32) * 5 / 9
      if (unit === 'K') return val - 273.15
      if (unit === 'R') return (val - 491.67) * 5 / 9
      return val
    },
    fromBase: (val, unit) => {
      if (unit === 'C') return val
      if (unit === 'F') return val * 9 / 5 + 32
      if (unit === 'K') return val + 273.15
      if (unit === 'R') return (val + 273.15) * 9 / 5
      return val
    },
  },
  {
    name: 'Area',
    units: [
      { label: 'Square Kilometer (km²)', value: 'km2', factor: 1e6 },
      { label: 'Square Meter (m²)', value: 'm2', factor: 1 },
      { label: 'Square Centimeter (cm²)', value: 'cm2', factor: 1e-4 },
      { label: 'Square Millimeter (mm²)', value: 'mm2', factor: 1e-6 },
      { label: 'Hectare (ha)', value: 'ha', factor: 1e4 },
      { label: 'Acre (ac)', value: 'ac', factor: 4046.856 },
      { label: 'Square Mile (mi²)', value: 'mi2', factor: 2589988.11 },
      { label: 'Square Yard (yd²)', value: 'yd2', factor: 0.836127 },
      { label: 'Square Foot (ft²)', value: 'ft2', factor: 0.0929030 },
      { label: 'Square Inch (in²)', value: 'in2', factor: 6.4516e-4 },
    ],
  },
  {
    name: 'Volume',
    units: [
      { label: 'Cubic Meter (m³)', value: 'm3', factor: 1 },
      { label: 'Liter (L)', value: 'L', factor: 0.001 },
      { label: 'Milliliter (mL)', value: 'mL', factor: 1e-6 },
      { label: 'Cubic Centimeter (cm³)', value: 'cm3', factor: 1e-6 },
      { label: 'Cubic Foot (ft³)', value: 'ft3', factor: 0.0283168 },
      { label: 'Cubic Inch (in³)', value: 'in3', factor: 1.63871e-5 },
      { label: 'US Gallon (gal)', value: 'gal', factor: 0.00378541 },
      { label: 'US Quart (qt)', value: 'qt', factor: 9.46353e-4 },
      { label: 'US Pint (pt)', value: 'pt', factor: 4.73176e-4 },
      { label: 'US Cup', value: 'cup', factor: 2.36588e-4 },
      { label: 'US Fluid Ounce (fl oz)', value: 'floz', factor: 2.95735e-5 },
      { label: 'Imperial Gallon (imp gal)', value: 'impgal', factor: 0.00454609 },
    ],
  },
  {
    name: 'Speed',
    units: [
      { label: 'Meter / second (m/s)', value: 'ms', factor: 1 },
      { label: 'Kilometer / hour (km/h)', value: 'kmh', factor: 1 / 3.6 },
      { label: 'Mile / hour (mph)', value: 'mph', factor: 0.44704 },
      { label: 'Knot (kn)', value: 'kn', factor: 0.514444 },
      { label: 'Foot / second (ft/s)', value: 'fts', factor: 0.3048 },
      { label: 'Mach (at sea level)', value: 'mach', factor: 340.29 },
      { label: 'Speed of Light (c)', value: 'c', factor: 299792458 },
    ],
  },
  {
    name: 'Time',
    units: [
      { label: 'Nanosecond (ns)', value: 'ns', factor: 1e-9 },
      { label: 'Microsecond (μs)', value: 'us', factor: 1e-6 },
      { label: 'Millisecond (ms)', value: 'ms', factor: 1e-3 },
      { label: 'Second (s)', value: 's', factor: 1 },
      { label: 'Minute (min)', value: 'min', factor: 60 },
      { label: 'Hour (h)', value: 'h', factor: 3600 },
      { label: 'Day (d)', value: 'd', factor: 86400 },
      { label: 'Week (wk)', value: 'wk', factor: 604800 },
      { label: 'Month (30d)', value: 'mo', factor: 2592000 },
      { label: 'Year (365d)', value: 'yr', factor: 31536000 },
    ],
  },
  {
    name: 'Data Storage',
    units: [
      { label: 'Bit (b)', value: 'b', factor: 1 },
      { label: 'Kilobit (Kb)', value: 'Kb', factor: 1e3 },
      { label: 'Megabit (Mb)', value: 'Mb', factor: 1e6 },
      { label: 'Gigabit (Gb)', value: 'Gb', factor: 1e9 },
      { label: 'Byte (B)', value: 'B', factor: 8 },
      { label: 'Kilobyte (KB)', value: 'KB', factor: 8e3 },
      { label: 'Megabyte (MB)', value: 'MB', factor: 8e6 },
      { label: 'Gigabyte (GB)', value: 'GB', factor: 8e9 },
      { label: 'Terabyte (TB)', value: 'TB', factor: 8e12 },
      { label: 'Petabyte (PB)', value: 'PB', factor: 8e15 },
      { label: 'Kibibyte (KiB)', value: 'KiB', factor: 8 * 1024 },
      { label: 'Mebibyte (MiB)', value: 'MiB', factor: 8 * 1024 ** 2 },
      { label: 'Gibibyte (GiB)', value: 'GiB', factor: 8 * 1024 ** 3 },
      { label: 'Tebibyte (TiB)', value: 'TiB', factor: 8 * 1024 ** 4 },
    ],
  },
  {
    name: 'Pressure',
    units: [
      { label: 'Pascal (Pa)', value: 'Pa', factor: 1 },
      { label: 'Kilopascal (kPa)', value: 'kPa', factor: 1e3 },
      { label: 'Megapascal (MPa)', value: 'MPa', factor: 1e6 },
      { label: 'Bar', value: 'bar', factor: 1e5 },
      { label: 'Millibar (mbar)', value: 'mbar', factor: 100 },
      { label: 'Atmosphere (atm)', value: 'atm', factor: 101325 },
      { label: 'Torr (mmHg)', value: 'torr', factor: 133.322 },
      { label: 'PSI (lb/in²)', value: 'psi', factor: 6894.757 },
    ],
  },
  {
    name: 'Energy',
    units: [
      { label: 'Joule (J)', value: 'J', factor: 1 },
      { label: 'Kilojoule (kJ)', value: 'kJ', factor: 1e3 },
      { label: 'Megajoule (MJ)', value: 'MJ', factor: 1e6 },
      { label: 'Calorie (cal)', value: 'cal', factor: 4.184 },
      { label: 'Kilocalorie (kcal)', value: 'kcal', factor: 4184 },
      { label: 'Watt-hour (Wh)', value: 'Wh', factor: 3600 },
      { label: 'Kilowatt-hour (kWh)', value: 'kWh', factor: 3.6e6 },
      { label: 'Electron Volt (eV)', value: 'eV', factor: 1.60218e-19 },
      { label: 'BTU', value: 'BTU', factor: 1055.06 },
      { label: 'Foot-pound (ft·lb)', value: 'ftlb', factor: 1.35582 },
    ],
  },
  {
    name: 'Power',
    units: [
      { label: 'Watt (W)', value: 'W', factor: 1 },
      { label: 'Kilowatt (kW)', value: 'kW', factor: 1e3 },
      { label: 'Megawatt (MW)', value: 'MW', factor: 1e6 },
      { label: 'Gigawatt (GW)', value: 'GW', factor: 1e9 },
      { label: 'Horsepower (hp)', value: 'hp', factor: 745.7 },
      { label: 'Metric Horsepower (PS)', value: 'PS', factor: 735.499 },
      { label: 'BTU / hour', value: 'BTUh', factor: 0.293071 },
      { label: 'Foot-pound / second', value: 'ftlbs', factor: 1.35582 },
    ],
  },
  {
    name: 'Frequency',
    units: [
      { label: 'Hertz (Hz)', value: 'Hz', factor: 1 },
      { label: 'Kilohertz (kHz)', value: 'kHz', factor: 1e3 },
      { label: 'Megahertz (MHz)', value: 'MHz', factor: 1e6 },
      { label: 'Gigahertz (GHz)', value: 'GHz', factor: 1e9 },
      { label: 'Terahertz (THz)', value: 'THz', factor: 1e12 },
      { label: 'RPM', value: 'rpm', factor: 1 / 60 },
    ],
  },
  {
    name: 'Angle',
    units: [
      { label: 'Degree (°)', value: 'deg', factor: Math.PI / 180 },
      { label: 'Radian (rad)', value: 'rad', factor: 1 },
      { label: 'Gradian (grad)', value: 'grad', factor: Math.PI / 200 },
      { label: 'Arcminute (\')', value: 'arcmin', factor: Math.PI / 10800 },
      { label: 'Arcsecond (")', value: 'arcsec', factor: Math.PI / 648000 },
      { label: 'Turn (revolution)', value: 'turn', factor: 2 * Math.PI },
    ],
  },
  {
    name: 'Fuel Economy',
    units: [
      { label: 'km / Liter (km/L)', value: 'kmL', factor: 1 },
      { label: 'Liter / 100km (L/100km)', value: 'L100km', factor: 0 }, // special inverse
      { label: 'MPG (US)', value: 'mpgUS', factor: 0.425144 },
      { label: 'MPG (Imperial)', value: 'mpgImp', factor: 0.354006 },
      { label: 'Miles / Liter (mi/L)', value: 'miL', factor: 1.60934 },
    ],
    toBase: (val, unit) => {
      if (unit === 'L100km') return val === 0 ? Infinity : 100 / val
      const u = CATEGORIES.find(c => c.name === 'Fuel Economy')!.units.find(u => u.value === unit)
      return val * (u?.factor ?? 1)
    },
    fromBase: (val, unit) => {
      if (unit === 'L100km') return val === 0 ? Infinity : 100 / val
      const u = CATEGORIES.find(c => c.name === 'Fuel Economy')!.units.find(u => u.value === unit)
      return val / (u?.factor ?? 1)
    },
  },
]

function formatNum(n: number): string {
  if (!isFinite(n)) return '∞'
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1e15 || (abs < 1e-6 && abs > 0)) return n.toExponential(6)
  const str = parseFloat(n.toPrecision(10)).toString()
  return str
}

function convert(value: number, fromUnit: string, toUnit: string, category: Category): number {
  if (fromUnit === toUnit) return value
  if (category.toBase && category.fromBase) {
    const base = category.toBase(value, fromUnit)
    return category.fromBase(base, toUnit)
  }
  const from = category.units.find(u => u.value === fromUnit)
  const to = category.units.find(u => u.value === toUnit)
  if (!from?.factor || !to?.factor) return NaN
  return (value * from.factor) / to.factor
}

const REFERENCE_SAMPLES: Record<string, [string, string, number][]> = {
  'Length': [['1 km', 'm', 1000], ['1 mi', 'km', 1.609344], ['1 ft', 'cm', 30.48], ['1 in', 'mm', 25.4]],
  'Weight / Mass': [['1 kg', 'lb', 2.20462], ['1 lb', 'g', 453.592], ['1 oz', 'g', 28.3495]],
  'Temperature': [['0°C', 'F', 32], ['100°C', 'F', 212], ['37°C (body)', 'F', 98.6], ['0°F', 'C', -17.778]],
  'Area': [['1 ha', 'm²', 10000], ['1 ac', 'ha', 0.404686], ['1 mi²', 'km²', 2.58999]],
  'Volume': [['1 L', 'mL', 1000], ['1 gal (US)', 'L', 3.78541], ['1 ft³', 'L', 28.3168]],
  'Speed': [['1 mph', 'km/h', 1.60934], ['1 knot', 'm/s', 0.514444], ['Mach 1', 'km/h', 1234.8]],
  'Time': [['1 day', 'h', 24], ['1 week', 'd', 7], ['1 year', 'd', 365]],
  'Data Storage': [['1 GB', 'MB', 1000], ['1 GiB', 'MiB', 1024], ['1 TB', 'GB', 1000]],
  'Pressure': [['1 atm', 'Pa', 101325], ['1 bar', 'Pa', 100000], ['1 psi', 'Pa', 6894.757]],
  'Energy': [['1 kWh', 'kJ', 3600], ['1 kcal', 'J', 4184], ['1 BTU', 'J', 1055.06]],
  'Power': [['1 hp', 'W', 745.7], ['1 kW', 'hp', 1.34102], ['1 MW', 'kW', 1000]],
  'Frequency': [['1 GHz', 'MHz', 1000], ['60 Hz', 'rpm', 3600], ['1 THz', 'GHz', 1000]],
  'Angle': [['360°', 'rad', 6.28318], ['1 rad', 'deg', 57.2958], ['90°', 'grad', 100]],
  'Fuel Economy': [['30 mpg US', 'L/100km', 7.84], ['10 km/L', 'L/100km', 10], ['20 mpg Imp', 'km/L', 7.08]],
}

function getFormula(fromUnit: string, toUnit: string, category: Category): string {
  if (fromUnit === toUnit) return 'Same unit — no conversion needed'
  if (category.name === 'Temperature') {
    const key = `${fromUnit}-${toUnit}`
    const formulas: Record<string, string> = {
      'C-F': '°F = °C × 9/5 + 32',
      'F-C': '°C = (°F − 32) × 5/9',
      'C-K': 'K = °C + 273.15',
      'K-C': '°C = K − 273.15',
      'C-R': '°R = (°C + 273.15) × 9/5',
      'R-C': '°C = (°R − 491.67) × 5/9',
      'F-K': 'K = (°F + 459.67) × 5/9',
      'K-F': '°F = K × 9/5 − 459.67',
      'F-R': '°R = °F + 459.67',
      'R-F': '°F = °R − 459.67',
      'K-R': '°R = K × 9/5',
      'R-K': 'K = °R × 5/9',
    }
    return formulas[key] ?? 'Convert via Celsius'
  }
  if (category.name === 'Fuel Economy' && (fromUnit === 'L100km' || toUnit === 'L100km')) {
    return 'L/100km is inverted: multiply/divide accordingly'
  }
  const from = category.units.find(u => u.value === fromUnit)
  const to = category.units.find(u => u.value === toUnit)
  if (from?.factor && to?.factor) {
    const ratio = from.factor / to.factor
    const ratioStr = ratio >= 1e6 || ratio < 1e-4 ? ratio.toExponential(4) : parseFloat(ratio.toPrecision(6)).toString()
    return `${from.label.split(' ')[0]} × ${ratioStr} = ${to.label.split(' ')[0]}`
  }
  return ''
}

export default function UnitConverter() {
  const [categoryIdx, setCategoryIdx] = useState(0)
  const [fromUnit, setFromUnit] = useState('')
  const [toUnit, setToUnit] = useState('')
  const [inputValue, setInputValue] = useState('1')

  const category = CATEGORIES[categoryIdx]!

  // Reset units when category changes
  const handleCategoryChange = (idx: number) => {
    setCategoryIdx(idx)
    setFromUnit(CATEGORIES[idx]!.units[0]!.value)
    setToUnit(CATEGORIES[idx]!.units[1]!.value)
  }

  // Initialize
  useMemo(() => {
    setFromUnit(category.units[0]!.value)
    setToUnit(category.units[1]!.value)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const numInput = parseFloat(inputValue)
  const result = !isNaN(numInput) && fromUnit && toUnit
    ? convert(numInput, fromUnit, toUnit, category)
    : NaN

  const formula = fromUnit && toUnit ? getFormula(fromUnit, toUnit, category) : ''

  const handleSwap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  const refSamples = REFERENCE_SAMPLES[category.name] ?? []

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div>
        <label className="label-text block mb-1">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryChange(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryIdx === i
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <label className="label-text block">From</label>
          <select
            value={fromUnit}
            onChange={e => setFromUnit(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {category.units.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSwap}
          className="btn-secondary mb-0.5 p-2"
          title="Swap units"
        >
          <ArrowRightLeft size={16} />
        </button>
        <div className="flex-1 space-y-1">
          <label className="label-text block">To</label>
          <select
            value={toUnit}
            onChange={e => setToUnit(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {category.units.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Value input */}
      <div>
        <label className="label-text block mb-1">Value</label>
        <input
          type="number"
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Enter value..."
        />
      </div>

      {/* Result */}
      {!isNaN(result) && fromUnit && toUnit && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
          <div className="text-3xl font-mono font-bold text-primary-600 dark:text-primary-400 break-all">
            {formatNum(result)}{' '}
            <span className="text-lg text-gray-500 dark:text-gray-400 font-normal">
              {category.units.find(u => u.value === toUnit)?.label.split(' ')[0]}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatNum(numInput)} {category.units.find(u => u.value === fromUnit)?.label.split(' ')[0]}
            {' = '}
            {formatNum(result)} {category.units.find(u => u.value === toUnit)?.label.split(' ')[0]}
          </div>
          {formula && (
            <div className="text-xs font-mono bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-400">
              Formula: {formula}
            </div>
          )}
        </div>
      )}

      {/* Reference table */}
      {refSamples.length > 0 && (
        <div>
          <h3 className="label-text mb-2">Common Conversions — {category.name}</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">From</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">To</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Result</th>
                </tr>
              </thead>
              <tbody>
                {refSamples.map(([label, toUnitLabel, val], i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono">{label}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{toUnitLabel}</td>
                    <td className="px-3 py-2 text-right font-mono text-primary-600 dark:text-primary-400">{formatNum(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
