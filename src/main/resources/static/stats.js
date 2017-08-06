//  Copyright 2017 Zachary James Guard
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

var stats = {}

stats.mean = function(values) {
  var length = values.length
  var sum = 0
  for (let i = 0; i < length; i++) {
    sum += i
  }
  return sum/length
}

stats.median = function(values) { // returns Array
  var length = values.length
  var valuesSorted = values.sort(function(a, b) {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })
  if (length % 2 === 0) { // n(values) is even
    var medians = [valuesSorted[length / 2 - 1], valuesSorted[length / 2]]
    if (medians[0] === medians[1]) {
      return medians[0]
    } else {
      return medians
    }
  } else {
    return [valuesSorted[Math.floor(length / 2)]]
  }
}

stats.medianPresorted = function(values) { // returns Array
  var length = values.length
  if (length % 2 === 0) { // n(values) is even
    var medians = [values[length / 2 - 1], values[length / 2]]
    if (medians[0] === medians[1]) {
      return medians[0]
    } else {
      return medians
    }
  } else {
    return [values[Math.floor(length / 2)]]
  }
}

stats.medianQuick = function(values) {
  var valuesSorted = values.sort(function(a, b) {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })
  return valuesSorted[Math.floor(values.length / 2)]
}

stats.medianQuickPresorted = function(values) {
  return values[Math.floor(values.length / 2)]
}

stats.mode = function(values) { // returns Array
  var occurrences = {}
  for (let i = 0, l = values.length; i < l; i++) {
    var n = values[i]
    if (occurrences.hasOwnProperty(n)) {
      occurrences[n] += 1
    } else {
      occurrences[n] = 1
    }
  }
  var valuesSortedByFrequency = values.sort(function(a, b) {
    var occA = occurrences[a]
    var occB = occurrences[b]
    if (occA > occB) return -1
    if (occA < occB) return 1
    return 0
  })
  if (occurrences[valuesSortedByFrequency[0]] === occurrences[valuesSortedByFrequency[1]]) {
    var lastModeIndex
    var occFirst = occurrences[valuesSortedByFrequency[0]]
    for (let i = 0, l = valuesSortedByFrequency.length; i < l; i++) {
      if (occurrences[valuesSortedByFrequency[i]] < occFirst) {
        lastModeIndex = i - 1
        break
      }
    }
    var valuesSliced = valuesSortedByFrequency.slice(0, lastModeIndex + 1)
    var valuesSlicedDeduped = []
    for (let i = 0; i < lastModeIndex + 1; i++) { // lastModeIndex + 1 is equivalent to valuesSliced.length
      var n = valuesSliced[i]
      if (valuesSlicedDeduped.indexOf(n) === -1) {
        valuesSlicedDeduped.push(n)
      }
    }
    return valuesSlicedDeduped
  } else {
    return [valuesSortedByFrequency[0]]
  }
}

stats.modeQuick = function(values) {
  var occurrences = {}
  for (let i = 0, l = values.length; i < l; i++) {
    var n = values[i]
    if (occurrences.hasOwnProperty(n)) {
      occurrences[n] += 1
    } else {
      occurrences[n] = 1
    }
  }
  var valuesSortedByFrequency = values.sort(function(a, b) {
    var occA = occurrences[a]
    var occB = occurrences[b]
    if (occA > occB) return -1
    if (occA < occB) return 1
    return 0
  })
  return valuesSortedByFrequency[0]
}
