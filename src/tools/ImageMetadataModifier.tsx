import React, { useState, useCallback, useMemo } from 'react'
import ExifReader from 'exifreader'
import * as piexif from 'piexifjs'
import { Upload, Download, MapPin, Calendar, Info, Trash2, Camera, Eye } from 'lucide-react'
import { useToast } from '../context/ToastContext'

/** 
 * Popular editable fields configuration.
 */
const EDITABLE_FIELDS = [
  { key: 'Make', label: 'Camera Brand', section: '0th', icon: <Camera size={14} /> },
  { key: 'Model', label: 'Camera Model', section: '0th', icon: <Camera size={14} /> },
  { key: 'Software', label: 'Processing Software', section: '0th', icon: <Info size={14} /> },
  { key: 'DateTime', label: 'Date/Time Taken', section: '0th', icon: <Calendar size={14} /> },
  { key: 'Artist', label: 'Author/Photographer', section: '0th', icon: <Info size={14} /> },
  { key: 'Copyright', label: 'Copyright Notice', section: '0th', icon: <Info size={14} /> },
  { key: 'ImageDescription', label: 'Description/Title', section: '0th', icon: <Info size={14} /> },
  { key: 'UserComment', label: 'User Comments', section: 'Exif', icon: <Info size={14} /> },
]

export default function ImageMetadataModifier() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [editableValues, setEditableValues] = useState<Record<string, string>>({})
  const [gps, setGps] = useState<{ lat: string; lon: string }>({ lat: '', lon: '' })
  const { showToast } = useToast()

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    
    const isJpeg = selected.type === 'image/jpeg' || selected.type === 'image/jpg'
    if (!isJpeg) {
      showToast('Reading all metadata, but editing/saving is currently optimized for JPEG only.', 'info')
    }

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const buffer = event.target?.result as ArrayBuffer
        const tags = ExifReader.load(buffer)
        setMetadata(tags)

        const newEditable: Record<string, string> = {}
        EDITABLE_FIELDS.forEach(field => {
          if (tags[field.key]) {
            newEditable[field.key] = tags[field.key].description || ''
          } else {
            newEditable[field.key] = ''
          }
        })
        setEditableValues(newEditable)

        if (tags['GPSLatitude'] && tags['GPSLongitude']) {
          setGps({
            lat: tags['GPSLatitude'].description.replace(/[^\d.-]/g, ''),
            lon: tags['GPSLongitude'].description.replace(/[^\d.-]/g, '')
          })
        } else {
          setGps({ lat: '', lon: '' })
        }
      }
      reader.readAsArrayBuffer(selected)
    } catch (err) {
      console.error(err)
      showToast('Failed to read image metadata', 'error')
    }
  }, [showToast])

  const handleDownload = useCallback(() => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      try {
        const exifObj = (piexif as any).load(result)
        const zeroth = exifObj["0th"] || {}
        const exifSection = exifObj["Exif"] || {}
        const gpsSection = exifObj["GPS"] || {}

        Object.entries(editableValues).forEach(([key, value]) => {
          const fieldDef = EDITABLE_FIELDS.find(f => f.key === key)
          if (!fieldDef || !value) return
          
          const sectionKey = fieldDef.section === '0th' ? 'Image' : fieldDef.section
          const tagId = ((piexif as any).TAGS[sectionKey] || (piexif as any).TAGS[fieldDef.section])[key]
          
          if (tagId !== undefined) {
             const tagIdNum = Number(tagId)
             let finalValue = value
             if (key === 'UserComment' && !value.toString().startsWith('ASCII')) {
                finalValue = 'ASCII\0\0\0' + value
             }

             if (fieldDef.section === '0th') zeroth[tagIdNum] = finalValue
             else if (fieldDef.section === 'Exif') exifSection[tagIdNum] = finalValue
          }
        })

        if (gps.lat && gps.lon) {
          const lat = parseFloat(gps.lat)
          const lon = parseFloat(gps.lon)
          const GPSTags = (piexif as any).TagValues.GPSTag
          gpsSection[Number(GPSTags.GPSLatitudeRef)] = lat >= 0 ? 'N' : 'S'
          gpsSection[Number(GPSTags.GPSLatitude)] = (piexif as any).GPSHelper.degToDegMinSec(Math.abs(lat))
          gpsSection[Number(GPSTags.GPSLongitudeRef)] = lon >= 0 ? 'E' : 'W'
          gpsSection[Number(GPSTags.GPSLongitude)] = (piexif as any).GPSHelper.degToDegMinSec(Math.abs(lon))
        }

        exifObj["0th"] = zeroth
        exifObj["Exif"] = exifSection
        exifObj["GPS"] = gpsSection

        const exifBytes = (piexif as any).dump(exifObj)
        const newJpeg = (piexif as any).insert(exifBytes, result)

        const byteString = atob(newJpeg.split(',')[1])
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
        const blob = new Blob([ab], { type: 'image/jpeg' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `edited_${Date.now()}_${file.name}`
        link.click()
        showToast('Image downloaded with new metadata!', 'success')
      } catch (err) {
        console.error('Metadata Write Error:', err)
        showToast('Failed to write metadata', 'error')
      }
    }
    reader.readAsDataURL(file)
  }, [file, editableValues, gps, showToast])

  const sortedMetadata = useMemo(() => {
    if (!metadata) return []
    return Object.entries(metadata)
      .filter(([key]) => key !== 'MakerNote')
      .sort((a, b) => a[0].localeCompare(b[0]))
  }, [metadata])

  return (
    <div className="space-y-6">
      {!file ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-12 bg-white dark:bg-gray-950 transition-colors hover:border-primary-500 group">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-gray-900 dark:text-white font-semibold mb-1">Upload an image to inspect</p>
          <p className="text-gray-500 text-sm mb-6">Supports JPEG, PNG, WebP, HEIC & More</p>
          <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={onFileChange} />
          <label htmlFor="image-upload" className="btn-primary cursor-pointer px-8">Select Image</label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
           <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                <img src={previewUrl!} alt="Preview" className="w-full h-full object-cover" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{file.name}</h3>
               <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
             </div>
           </div>
           <div className="flex gap-2">
             {file.type !== 'image/jpeg' && file.type !== 'image/jpg' ? (
                <div className="text-xs text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-lg border border-orange-200 dark:border-orange-800 flex items-center mr-2">
                   Edit/Save currently supports JPEG only
                </div>
             ) : (
                <button onClick={handleDownload} className="btn-primary flex items-center gap-2 px-4 shadow-sm shadow-primary-500/20">
                  <Download size={16} /> Save & Download
                </button>
             )}
             <button onClick={() => { setFile(null); setMetadata(null); setPreviewUrl(null) }} className="btn-ghost text-red-500">
               <Trash2 size={18} />
             </button>
           </div>
        </div>
      )}

      {file && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
                <Info size={18} className="text-primary-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Key Information</h2>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {EDITABLE_FIELDS.map(field => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                      {field.icon} {field.label}
                    </label>
                    <input 
                      type="text" 
                      placeholder={field.key === 'DateTime' ? 'YYYY:MM:DD HH:MM:SS' : `Enter ${field.label.toLowerCase()}...`}
                      value={editableValues[field.key]} 
                      onChange={e => setEditableValues(v => ({ ...v, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-900 transition-all text-gray-800 dark:text-gray-200"
                    />
                    {field.key === 'DateTime' && (
                      <p className="text-[10px] text-gray-400 ml-1">Format: YYYY:MM:DD HH:MM:SS</p>
                    )}
                  </div>
                ))}
                
                <div className="sm:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                   <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                        <MapPin size={14} /> Location (GPS Coordinates)
                      </label>
                      <span className="text-[10px] text-gray-400">Use decimal format (e.g. 10.7626)</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Latitude" 
                        value={gps.lat} 
                        onChange={e => setGps(v => ({ ...v, lat: e.target.value }))}
                        className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
                      />
                      <input 
                        type="text" 
                        placeholder="Longitude" 
                        value={gps.lon} 
                        onChange={e => setGps(v => ({ ...v, lon: e.target.value }))}
                        className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col shadow-sm max-h-[550px]">
             <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Eye size={18} className="text-gray-400" />
                   <h2 className="text-lg font-bold text-gray-900 dark:text-white font-mono">Full RAW Metadata</h2>
                </div>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-widest">{sortedMetadata.length} Tags</span>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <table className="w-full text-xs font-mono">
                   <thead className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                      <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                         <th className="py-2 pr-4 font-normal">Tag</th>
                         <th className="py-2 font-normal">Value</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                      {sortedMetadata.map(([key, val]: [string, any]) => {
                        const editedValue = editableValues[key]
                        const isModified = editedValue !== undefined && editedValue !== (val.description || val.value || '') && editedValue !== ''
                        
                        return (
                          <tr key={key} className="group hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2">
                              {key}
                              {isModified && <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" title="Modified" />}
                            </td>
                            <td className={`py-2.5 break-all leading-relaxed ${isModified ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                              {isModified ? editedValue : String(val.description || val.value || val)}
                            </td>
                          </tr>
                        )
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {file && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {(editableValues.DateTime || metadata?.DateTime) && (
             <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center rounded-xl text-indigo-600 dark:text-indigo-400">
                   <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-indigo-400">Time Taken</p>
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{editableValues.DateTime || metadata.DateTime.description}</p>
                </div>
             </div>
           )}
           {(gps.lat || gps.lon) && (
             <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 flex items-center justify-center rounded-xl text-orange-600 dark:text-orange-400">
                   <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-orange-400">Coordinates</p>
                  <p className="text-sm font-bold text-orange-900 dark:text-indigo-100">{gps.lat || '0'}, {gps.lon || '0'}</p>
                </div>
             </div>
           )}
           {(editableValues.Make || metadata?.Make) && (
             <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 flex items-center justify-center rounded-xl text-teal-600 dark:text-teal-400">
                   <Camera size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-teal-400">Hardware</p>
                  <p className="text-sm font-bold text-teal-900 dark:text-teal-100">{editableValues.Make || metadata.Make.description} {editableValues.Model || metadata.Model?.description}</p>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  )
}
