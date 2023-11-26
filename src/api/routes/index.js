import express from 'express'
import EventController from '../event/event.controller.js'

const router = express.Router()

router.route('/block/events').post(EventController.CreateBlockedEvents)
router.route('/block/events').delete(EventController.DeleteBlockedEvent)
router.route('/events').get(EventController.GetEventsByDate)
router.route('/events').patch(EventController.UpdateEvents)

export default router