import {StatusCodes} from 'http-status-codes'
import EventService from './event.service.js'
import { v4 as uuidv4 } from 'uuid'
import { EventStatuses } from '../utils/constants.js'
import { configurarTemporizador } from '../utils/timer.js'
import dayjs from 'dayjs'
import 'dayjs/locale/es.js'
dayjs.locale('es')

const EventController = {
  CreateBlockedEvents: async (req, res) => {
    const { blockedEvents } = req.body

    if(!blockedEvents || blockedEvents.length < 0){
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'No hay eventos para crear'})
    }

    const createdAt = dayjs().format()

    const formattedEvents = blockedEvents.map(event => {
      return {
        uuid: uuidv4(),
        ...event,
        status: EventStatuses.BLOCKED,
        expirationDate: dayjs(createdAt).add("10", "minutes").format(),
        createdAt,
      }
    })

    const createdEvents = await EventService.createEvents(formattedEvents)

    if(createdEvents.length !== formattedEvents.length){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Error creando eventos'})
    }

    const eventUuids = createdEvents.map(event => event.uuid)
    const expirationDate = createdEvents[0].expirationDate
    configurarTemporizador(eventUuids, expirationDate)

    return res.status(StatusCodes.OK).json({message: 'Eventos creados correctamente'})
  },
  DeleteBlockedEvent: async (req, res) => {
    const { eventUUID } = req.body

    if(!eventUUID){
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'No hay evento para eliminar'})
    }

    const deletedEvent = await EventService.deleteEvents([eventUUID])

    if(!deletedEvent){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Error eliminando evento'})
    }

    return res.status(StatusCodes.OK).json({message: 'Evento eliminado correctamente'})
  },
  UpdateEvents: async (req, res) => {
    const { eventsUUIDs } = req.body

    if(!eventsUUIDs || eventsUUIDs.length < 0){
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'No hay eventos para actualizar'})
    }

    const updateData = {
      status: EventStatuses.SCHEDULED,
      expirationDate: null,
    }

    const updatedEvents = await EventService.updateEvents(eventsUUIDs, updateData)

    if(updatedEvents.length !== eventsUUIDs.length){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Error actualizando eventos'})
    }

    return res.status(StatusCodes.OK).json({message: 'Eventos actualizados correctamente'})
  },
  GetEventsByDate: async (req, res) => {
    const { date } = req.query

    if(!date){
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'No hay fecha para buscar eventos'})
    }

    const events = await EventService.getEventsByDate(date)

    if(!events){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Error obteniendo eventos'})
    }

    return res.status(StatusCodes.OK).json(events)
  },
}


export default EventController