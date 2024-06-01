import React, { useEffect, useState } from 'react'

/**
 * @typedef MultiSelectKeyValuePair
 * @property {string} id value that can be selected
 * @property {string} name that will be displayed
 * 
 */

/**
 * @param {MultiSelectKeyValuePair[]} allKV all key-value pairs available to select from 
 * @param {MultiSelectKeyValuePair[]} selectedKV subset of allKV that were selected
 * @param {function(MultiSelectKeyValuePair[]): void} onChange
 * @param {String} className
 * @returns 
 */
function GroupMembersInput({ allKV, selectedKV, onChange, className }) {
  const [selected, setSelected] = useState([])
  const [excluded, setExcluded] = useState([])
  // 'toAdd' and 'toRemove' are arrays of keys only
  const [toAdd, setToAdd] = useState([])
  const [toRemove, setToRemove] = useState([])

  useEffect(() => {
    setSelected(prev => selectedKV ?? prev)
    setExcluded(prev => allKV.filter(item => !selectedKV?.some(s => s.id == item.id)) ?? prev)
  }, [allKV, selectedKV])

  const handleAdd = () => {
    // add to selected list
    const objArrToAdd = allKV.filter(item => toAdd.includes(item.id))
    const result = [...selected, ...objArrToAdd]
    setSelected(result)
    // remove from excluded list ("toAdd" state var is the value of "excluded" select multiple input field)
    setExcluded(prev => prev.filter(item => !toAdd.includes(item.id)))
    // reset values of input fields
    setToRemove([])
    setToAdd([])
    // notify caller
    onChange(result)
  }

  const handleRemove = () => {
    // remove from selected list ("toRemove" state var is the value of "selected" select multiple input field)
    const result = selected.filter(item => !toRemove.includes(item.id))
    setSelected(result)
    // add to excluded list
    const objArrToRemove = allKV.filter(item => toRemove.includes(item.id))
    setExcluded(prev => [...prev, ...objArrToRemove])
    // reset values of input fields
    setToRemove([])
    setToAdd([])
    // notify caller
    onChange(result)
  }

  const handleChange = (e) => {
    let value = Array.from(e.target.selectedOptions, option => option.value);
    if (e.target.name == 'excluded') {
      setToAdd(value)
    }
    else if (e.target.name == 'selected') {
      setToRemove(value)
    }
  }

  return (
    <div className={className}>
      <div>
        <select name="excluded" id="" multiple value={[...toAdd]} onChange={handleChange}>
          <option value="0_EXCLUDED" disabled>excluded</option>
          {
            excluded
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(item => {
                return (
                  <option key={item.id} value={item.id}>{item.name}</option>
                )
              })
          }
        </select>
      </div>
      <div style={{display:"flex", flexDirection:'column', justifyContent: 'space-around'}}>
        <button onClick={handleAdd}>{"\u27A1"}</button>
        <button onClick={handleRemove}>{"\u2B05"}</button>
      </div>
      <div>
        <select name="selected" id="" multiple value={[...toRemove]} onChange={handleChange}>
          <option value="0_SELECTED" disabled>selected</option>
          {
            selected
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(item => {
                return (
                  <option key={item.id} value={item.id}>{item.name}</option>
                )
              })
          }
        </select>
      </div>
    </div>
  )
}

export default GroupMembersInput