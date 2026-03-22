import { useState, useEffect, useCallback } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

// ── JSON Schema Validator ──────────────────────────────────────────────────────

interface ValidationError {
  path: string
  message: string
}

type SchemaObject = Record<string, unknown>
type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue }

function resolveRef(ref: string, rootSchema: SchemaObject): SchemaObject | null {
  if (!ref.startsWith('#/')) return null
  const parts = ref.slice(2).split('/')
  let current: unknown = rootSchema
  for (const part of parts) {
    const decoded = part.replace(/~1/g, '/').replace(/~0/g, '~')
    if (current === null || typeof current !== 'object') return null
    current = (current as Record<string, unknown>)[decoded]
  }
  if (current && typeof current === 'object') return current as SchemaObject
  return null
}

function getType(value: JsonValue): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function validate(
  data: JsonValue,
  schema: SchemaObject,
  path: string,
  rootSchema: SchemaObject,
  errors: ValidationError[]
): void {
  if (!schema || typeof schema !== 'object') return

  // $ref resolution
  if ('$ref' in schema) {
    const ref = schema['$ref'] as string
    const resolved = resolveRef(ref, rootSchema)
    if (resolved) {
      validate(data, resolved, path, rootSchema, errors)
    } else {
      errors.push({ path, message: `Cannot resolve $ref: ${ref}` })
    }
    return
  }

  // type
  if ('type' in schema) {
    const schemaTypes = Array.isArray(schema.type) ? schema.type : [schema.type]
    const dataType = getType(data)
    const typeMatch = schemaTypes.some((t: unknown) => {
      if (t === 'integer') return typeof data === 'number' && Number.isInteger(data)
      return t === dataType
    })
    if (!typeMatch) {
      errors.push({ path: path || '$', message: `Expected type ${(schemaTypes as string[]).join(' | ')}, got ${dataType}` })
    }
  }

  // enum
  if ('enum' in schema) {
    const enumVals = schema.enum as JsonValue[]
    const matched = enumVals.some(v => JSON.stringify(v) === JSON.stringify(data))
    if (!matched) {
      errors.push({ path: path || '$', message: `Value must be one of: ${enumVals.map(v => JSON.stringify(v)).join(', ')}` })
    }
  }

  // String validations
  if (typeof data === 'string') {
    if ('minLength' in schema && data.length < (schema.minLength as number)) {
      errors.push({ path: path || '$', message: `String length ${data.length} is less than minLength ${schema.minLength}` })
    }
    if ('maxLength' in schema && data.length > (schema.maxLength as number)) {
      errors.push({ path: path || '$', message: `String length ${data.length} exceeds maxLength ${schema.maxLength}` })
    }
    if ('pattern' in schema) {
      try {
        const re = new RegExp(schema.pattern as string)
        if (!re.test(data)) {
          errors.push({ path: path || '$', message: `String does not match pattern: ${schema.pattern}` })
        }
      } catch {
        errors.push({ path: path || '$', message: `Invalid regex pattern: ${schema.pattern}` })
      }
    }
  }

  // Number validations
  if (typeof data === 'number') {
    if ('minimum' in schema && data < (schema.minimum as number)) {
      errors.push({ path: path || '$', message: `Value ${data} is less than minimum ${schema.minimum}` })
    }
    if ('maximum' in schema && data > (schema.maximum as number)) {
      errors.push({ path: path || '$', message: `Value ${data} exceeds maximum ${schema.maximum}` })
    }
    if ('exclusiveMinimum' in schema) {
      const excMin = schema.exclusiveMinimum
      if (typeof excMin === 'number' && data <= excMin) {
        errors.push({ path: path || '$', message: `Value ${data} must be greater than exclusiveMinimum ${excMin}` })
      } else if (typeof excMin === 'boolean' && excMin && 'minimum' in schema && data <= (schema.minimum as number)) {
        errors.push({ path: path || '$', message: `Value ${data} must be strictly greater than minimum ${schema.minimum}` })
      }
    }
    if ('exclusiveMaximum' in schema) {
      const excMax = schema.exclusiveMaximum
      if (typeof excMax === 'number' && data >= excMax) {
        errors.push({ path: path || '$', message: `Value ${data} must be less than exclusiveMaximum ${excMax}` })
      } else if (typeof excMax === 'boolean' && excMax && 'maximum' in schema && data >= (schema.maximum as number)) {
        errors.push({ path: path || '$', message: `Value ${data} must be strictly less than maximum ${schema.maximum}` })
      }
    }
    if ('multipleOf' in schema && (data % (schema.multipleOf as number)) !== 0) {
      errors.push({ path: path || '$', message: `Value ${data} is not a multiple of ${schema.multipleOf}` })
    }
  }

  // Array validations
  if (Array.isArray(data)) {
    if ('minItems' in schema && data.length < (schema.minItems as number)) {
      errors.push({ path: path || '$', message: `Array length ${data.length} is less than minItems ${schema.minItems}` })
    }
    if ('maxItems' in schema && data.length > (schema.maxItems as number)) {
      errors.push({ path: path || '$', message: `Array length ${data.length} exceeds maxItems ${schema.maxItems}` })
    }
    if ('items' in schema) {
      const itemsSchema = schema.items
      if (Array.isArray(itemsSchema)) {
        itemsSchema.forEach((itemSchema, i) => {
          if (i < data.length) {
            validate(data[i] as JsonValue, itemSchema as SchemaObject, `${path}[${i}]`, rootSchema, errors)
          }
        })
        // additionalItems
        if ('additionalItems' in schema && schema.additionalItems === false) {
          for (let i = (itemsSchema as unknown[]).length; i < data.length; i++) {
            errors.push({ path: `${path}[${i}]`, message: 'Additional items not allowed' })
          }
        }
      } else if (itemsSchema && typeof itemsSchema === 'object') {
        data.forEach((item, i) => {
          validate(item as JsonValue, itemsSchema as SchemaObject, `${path}[${i}]`, rootSchema, errors)
        })
      }
    }
    if ('uniqueItems' in schema && schema.uniqueItems === true) {
      const seen: string[] = []
      data.forEach((item, i) => {
        const key = JSON.stringify(item)
        if (seen.includes(key)) {
          errors.push({ path: `${path}[${i}]`, message: 'Duplicate item (uniqueItems: true)' })
        } else {
          seen.push(key)
        }
      })
    }
  }

  // Object validations
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, JsonValue>

    if ('required' in schema) {
      const required = schema.required as string[]
      for (const req of required) {
        if (!(req in obj)) {
          errors.push({ path: path ? `${path}.${req}` : req, message: `Required property '${req}' is missing` })
        }
      }
    }

    if ('properties' in schema) {
      const properties = schema.properties as Record<string, SchemaObject>
      for (const [key, propSchema] of Object.entries(properties)) {
        if (key in obj) {
          validate(obj[key], propSchema, path ? `${path}.${key}` : key, rootSchema, errors)
        }
      }
    }

    if ('additionalProperties' in schema) {
      const addProps = schema.additionalProperties
      const knownKeys = new Set(Object.keys((schema.properties as Record<string, unknown>) || {}))
      const patternKeys = Object.keys((schema.patternProperties as Record<string, unknown>) || {})

      for (const key of Object.keys(obj)) {
        const isKnown = knownKeys.has(key)
        const matchesPattern = patternKeys.some(p => new RegExp(p).test(key))
        if (!isKnown && !matchesPattern) {
          if (addProps === false) {
            errors.push({ path: path ? `${path}.${key}` : key, message: `Additional property '${key}' is not allowed` })
          } else if (addProps && typeof addProps === 'object') {
            validate(obj[key], addProps as SchemaObject, path ? `${path}.${key}` : key, rootSchema, errors)
          }
        }
      }
    }

    if ('minProperties' in schema && Object.keys(obj).length < (schema.minProperties as number)) {
      errors.push({ path: path || '$', message: `Object has fewer properties than minProperties ${schema.minProperties}` })
    }
    if ('maxProperties' in schema && Object.keys(obj).length > (schema.maxProperties as number)) {
      errors.push({ path: path || '$', message: `Object has more properties than maxProperties ${schema.maxProperties}` })
    }

    if ('patternProperties' in schema) {
      const patternProps = schema.patternProperties as Record<string, SchemaObject>
      for (const [pattern, propSchema] of Object.entries(patternProps)) {
        const re = new RegExp(pattern)
        for (const key of Object.keys(obj)) {
          if (re.test(key)) {
            validate(obj[key], propSchema, path ? `${path}.${key}` : key, rootSchema, errors)
          }
        }
      }
    }
  }

  // Composition
  if ('allOf' in schema) {
    const allOf = schema.allOf as SchemaObject[]
    allOf.forEach((subSchema, i) => {
      validate(data, subSchema, path, rootSchema, errors)
    })
  }

  if ('anyOf' in schema) {
    const anyOf = schema.anyOf as SchemaObject[]
    const anyErrors: ValidationError[] = []
    const passed = anyOf.some(subSchema => {
      const subErrors: ValidationError[] = []
      validate(data, subSchema, path, rootSchema, subErrors)
      if (subErrors.length === 0) return true
      anyErrors.push(...subErrors)
      return false
    })
    if (!passed) {
      errors.push({ path: path || '$', message: 'Value does not match any of the anyOf schemas' })
    }
  }

  if ('oneOf' in schema) {
    const oneOf = schema.oneOf as SchemaObject[]
    const matchCount = oneOf.filter(subSchema => {
      const subErrors: ValidationError[] = []
      validate(data, subSchema, path, rootSchema, subErrors)
      return subErrors.length === 0
    }).length
    if (matchCount !== 1) {
      errors.push({ path: path || '$', message: `Value must match exactly one of the oneOf schemas (matched ${matchCount})` })
    }
  }

  if ('not' in schema) {
    const notSchema = schema.not as SchemaObject
    const subErrors: ValidationError[] = []
    validate(data, notSchema, path, rootSchema, subErrors)
    if (subErrors.length === 0) {
      errors.push({ path: path || '$', message: 'Value must not match the "not" schema' })
    }
  }

  if ('if' in schema) {
    const ifSchema = schema.if as SchemaObject
    const subErrors: ValidationError[] = []
    validate(data, ifSchema, path, rootSchema, subErrors)
    if (subErrors.length === 0 && 'then' in schema) {
      validate(data, schema.then as SchemaObject, path, rootSchema, errors)
    } else if (subErrors.length > 0 && 'else' in schema) {
      validate(data, schema.else as SchemaObject, path, rootSchema, errors)
    }
  }
}

function runValidation(dataStr: string, schemaStr: string): ValidationError[] | null {
  const data = JSON.parse(dataStr) as JsonValue
  const schema = JSON.parse(schemaStr) as SchemaObject
  const errors: ValidationError[] = []
  validate(data, schema, '', schema, errors)
  return errors
}

// ── Component ──────────────────────────────────────────────────────────────────

const EXAMPLE_JSON = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "tags": ["admin", "user"]
}`

const EXAMPLE_SCHEMA = `{
  "type": "object",
  "required": ["name", "age", "email"],
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "integer", "minimum": 0, "maximum": 150 },
    "email": { "type": "string", "pattern": "^[^@]+@[^@]+\\\\.[^@]+$" },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true
    }
  },
  "additionalProperties": false
}`

export default function JsonSchemaValidator() {
  const [jsonInput, setJsonInput] = useState(EXAMPLE_JSON)
  const [schemaInput, setSchemaInput] = useState(EXAMPLE_SCHEMA)
  const [errors, setErrors] = useState<ValidationError[] | null>(null)
  const [parseError, setParseError] = useState('')
  const [validated, setValidated] = useState(false)

  const runValidate = useCallback(() => {
    if (!jsonInput.trim() || !schemaInput.trim()) {
      setErrors(null)
      setParseError('')
      setValidated(false)
      return
    }
    try {
      const result = runValidation(jsonInput, schemaInput)
      setErrors(result)
      setParseError('')
      setValidated(true)
    } catch (e) {
      setParseError((e as Error).message)
      setErrors(null)
      setValidated(false)
    }
  }, [jsonInput, schemaInput])

  useEffect(() => {
    runValidate()
  }, [runValidate])

  const isValid = validated && errors !== null && errors.length === 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">JSON Data</label>
          <FileDropTextarea
            className="h-72"
            placeholder='{"name": "Alice", "age": 30}'
            value={jsonInput}
            onChange={setJsonInput}
            accept=".json,text/plain,text/*"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">JSON Schema</label>
          <FileDropTextarea
            className="h-72"
            placeholder={'{\n  "type": "object",\n  "required": ["name"],\n  "properties": {\n    "name": { "type": "string" }\n  }\n}'}
            value={schemaInput}
            onChange={setSchemaInput}
            accept=".json,text/plain,text/*"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={runValidate} className="btn-primary">Validate</button>
        <button
          onClick={() => { setJsonInput(EXAMPLE_JSON); setSchemaInput(EXAMPLE_SCHEMA) }}
          className="btn-secondary"
        >
          Load Example
        </button>
        <button
          onClick={() => { setJsonInput(''); setSchemaInput(''); setErrors(null); setParseError(''); setValidated(false) }}
          className="btn-ghost"
        >
          Clear
        </button>
      </div>

      {parseError && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          Parse error: {parseError}
        </div>
      )}

      {validated && !parseError && errors !== null && (
        isValid ? (
          <div className="text-sm px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 flex items-center gap-2 font-medium">
            <span>&#10003; Valid</span>
            <span className="font-normal text-green-600 dark:text-green-500">— JSON matches the schema.</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 font-medium">
              {errors.length} validation {errors.length === 1 ? 'error' : 'errors'} found
            </div>
            <div className="space-y-1">
              {errors.map((err, i) => (
                <div
                  key={i}
                  className="flex gap-3 text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900"
                >
                  <span className="font-mono text-xs text-red-500 dark:text-red-400 shrink-0 mt-0.5 min-w-[6rem] max-w-[12rem] truncate" title={err.path || '$'}>
                    {err.path || '$'}
                  </span>
                  <span className="text-red-700 dark:text-red-300">{err.message}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <CopyButton text={errors.map(e => `${e.path || '$'}: ${e.message}`).join('\n')} label="Copy errors" />
            </div>
          </div>
        )
      )}
    </div>
  )
}
