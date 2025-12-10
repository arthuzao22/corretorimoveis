import { useState, useCallback, useMemo } from 'react'

export type CalendarView = 'month' | 'week' | 'day'

export function useCalendario() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<CalendarView>('month')

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      if (view === 'month') {
        next.setMonth(next.getMonth() + 1)
      } else if (view === 'week') {
        next.setDate(next.getDate() + 7)
      } else {
        next.setDate(next.getDate() + 1)
      }
      return next
    })
  }, [view])

  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const previous = new Date(prev)
      if (view === 'month') {
        previous.setMonth(previous.getMonth() - 1)
      } else if (view === 'week') {
        previous.setDate(previous.getDate() - 7)
      } else {
        previous.setDate(previous.getDate() - 1)
      }
      return previous
    })
  }, [view])

  const changeView = useCallback((newView: CalendarView) => {
    setView(newView)
  }, [])

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  // Get the start and end dates for the current view
  const viewRange = useMemo(() => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    if (view === 'month') {
      // Start from the first day of the month
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      
      // End at the last day of the month
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      
      // Extend to show full weeks
      const startDay = start.getDay()
      start.setDate(start.getDate() - startDay)
      
      const endDay = end.getDay()
      if (endDay < 6) {
        end.setDate(end.getDate() + (6 - endDay))
      }
    } else if (view === 'week') {
      // Start from Sunday of the current week
      const day = start.getDay()
      start.setDate(start.getDate() - day)
      start.setHours(0, 0, 0, 0)
      
      // End on Saturday
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
    } else {
      // Single day
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }

    return {
      start,
      end,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    }
  }, [currentDate, view])

  // Get formatted display text
  const displayText = useMemo(() => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    
    if (view === 'month') {
      return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    } else if (view === 'week') {
      const startWeek = new Date(viewRange.start)
      const endWeek = new Date(viewRange.end)
      const startMonth = months[startWeek.getMonth()]
      const endMonth = months[endWeek.getMonth()]
      
      if (startMonth === endMonth) {
        return `${startWeek.getDate()} - ${endWeek.getDate()} de ${startMonth} ${startWeek.getFullYear()}`
      } else {
        return `${startWeek.getDate()} de ${startMonth} - ${endWeek.getDate()} de ${endMonth} ${startWeek.getFullYear()}`
      }
    } else {
      return `${currentDate.getDate()} de ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    }
  }, [currentDate, view, viewRange])

  return {
    currentDate,
    view,
    viewRange,
    displayText,
    goToToday,
    goToNext,
    goToPrevious,
    changeView,
    goToDate,
  }
}
