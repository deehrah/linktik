import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all events for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        ticketTypes: true,
        _count: {
          select: {
            orders: true,
            tickets: true,
          },
        },
      },
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: req.params.id,
        organizerId: req.user!.id,
      },
      include: {
        ticketTypes: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      dateTime,
      venueName,
      venueAddress,
      category,
      capacity,
      ticketTypes,
    } = req.body;

    if (!name || !dateTime || !venueName) {
      return res.status(400).json({ error: 'Name, date/time, and venue are required' });
    }

    const event = await prisma.event.create({
      data: {
        organizerId: req.user!.userId,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        dateTime: new Date(dateTime),
        venueName,
        venueAddress,
        category,
        capacity,
        status: 'DRAFT',
        isPublished: false,
        ticketTypes: ticketTypes
          ? {
              create: ticketTypes.map((tt: any) => ({
                name: tt.name,
                description: tt.description,
                price: tt.price,
                quantityTotal: tt.quantity,
                quantityLeft: tt.quantity,
              })),
            }
          : undefined,
      },
      include: {
        ticketTypes: true,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      dateTime,
      venueName,
      venueAddress,
      category,
      capacity,
      status,
      isPublished,
    } = req.body;

    const event = await prisma.event.findFirst({
      where: {
        id: req.params.id,
        organizerId: req.user!.userId,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        dateTime: dateTime ? new Date(dateTime) : undefined,
        venueName,
        venueAddress,
        category,
        capacity,
        status,
        isPublished,
      },
      include: {
        ticketTypes: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: req.params.id,
        organizerId: req.user!.userId,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await prisma.event.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
