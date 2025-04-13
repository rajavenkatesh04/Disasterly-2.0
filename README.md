# Disasterly

A disaster management and response coordination platform for communities and emergency services.

## Overview

Disasterly is an open-source platform designed to improve disaster response coordination through real-time information sharing, resource allocation, and community engagement. Our mission is to help communities prepare for, respond to, and recover from natural disasters and emergency situations.

## Features

- **Real-time Incident Mapping**: Visualize disaster events and affected areas on interactive maps
- **Resource Coordination**: Match available resources with areas of need
- **Community Alert System**: Send targeted notifications to affected populations
- **Volunteer Management**: Organize and coordinate volunteer efforts efficiently
- **Data Analytics**: Gain insights from historical disaster data to improve future responses
- **Offline Functionality**: Continue operations during network outages
- **Multi-agency Coordination**: Streamline communication between different emergency services

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- MongoDB (v4.4 or newer)
- Redis (optional, for enhanced performance)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/disasterly.git
cd disasterly

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your settings

# Start the development server
npm run dev
```

### Docker Deployment

```bash
# Build and start the containers
docker-compose up -d
```

## Usage

After starting the application, navigate to `http://localhost:3000` in your browser. First-time users will be prompted to create an account and set up their organization profile.

For detailed instructions on using specific features, please refer to our [documentation](https://docs.disasterly.org).

## Contributing

We welcome contributions from the community! Please check out our [contributing guidelines](CONTRIBUTING.md) for more information on how to get involved.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
- Check our [FAQ](https://docs.disasterly.org/faq)
- Join our [community forum](https://forum.disasterly.org)
- Report bugs via [GitHub Issues](https://github.com/your-username/disasterly/issues)

## Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org) for mapping data
- All our amazing contributors and community members
- Organizations and communities using Disasterly to make a difference