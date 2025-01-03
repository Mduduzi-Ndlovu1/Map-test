// Sample data structure for dynamic content
const data = {
  national: [
    { name: 'South Africa', imagePath: 'path/to/south_africa_flag.png' },
    { name: 'Mozambique', imagePath: 'path/to/mozambique_flag.png' },
    { name: 'Lesotho', imagePath: 'path/to/lesotho_flag.png' },
    { name: 'Eswatini', imagePath: 'path/to/eswatini_flag.png' },
    { name: 'Zimbabwe', imagePath: 'path/to/zimbabwe_flag.png' }
  ],
  provinces: [
    { name: 'Eastern Cape', imagePath: 'path/to/eastern_cape_flag.png' },
    { name: 'Free State', imagePath: 'path/to/free_state_flag.png' },
    { name: 'Gauteng', imagePath: 'path/to/gauteng_flag.png' },
    { name: 'KwaZulu-Natal', imagePath: 'path/to/kwazulu_natal_flag.png' },
    { name: 'Limpopo', imagePath: 'path/to/limpopo_flag.png' },
    { name: 'Mpumalanga', imagePath: 'path/to/mpumalanga_flag.png' },
    { name: 'Northern Cape', imagePath: 'path/to/northern_cape_flag.png' },
    { name: 'North West', imagePath: 'path/to/north_west_flag.png' },
    { name: 'Western Cape', imagePath: 'path/to/western_cape_flag.png' }
  ],
  municipalities: [
    { name: 'City of Cape Town Metropolitan Municipality', imagePath: 'path/to/city_of_cape_town_flag.png' },
    { name: 'City of Johannesburg Metropolitan Municipality', imagePath: 'path/to/city_of_johannesburg_flag.png' }
  ],
  wards: [
    { name: 'Ward 1', imagePath: 'path/to/ward_placeholder.png' },
    { name: 'Ward 2', imagePath: 'path/to/ward_placeholder.png' }
  ],
  sections: [
    { name: 'Section 1', imagePath: 'path/to/section_placeholder.png' },
    { name: 'Section 2', imagePath: 'path/to/section_placeholder.png' }
  ],
  streets: [
    { name: 'Street 1', imagePath: 'path/to/street_placeholder.png' },
    { name: 'Street 2', imagePath: 'path/to/street_placeholder.png' }
  ]
};

// Event listener for navigation button clicks
document.querySelectorAll('.nav-button').forEach(button => {
  button.addEventListener('click', function() {
    const locationType = button.getAttribute('data-location-type'); // Get location type (e.g., national, province)
    openModal(locationType);
  });
});

// Open modal and populate with dynamic data based on location type
function openModal(locationType) {
  const modal = document.getElementById('modal');
  
  // Clear previous content
  modal.querySelector('#logo-container').innerHTML = '';
  modal.querySelector('#hero-carousel').innerHTML = '';
  modal.querySelector('#community-flag').innerHTML = '';
  modal.querySelector('#community-hero-description').innerHTML = '';
  modal.querySelector('#timeline-container').innerHTML = '';
  modal.querySelector('#announcement-list').innerHTML = '';
  modal.querySelector('#achievements-content').innerHTML = '';
  modal.querySelector('#stats-charts-container').innerHTML = '';
  modal.querySelector('#news-list').innerHTML = '';

  // Populate modal sections dynamically
  if (data[locationType]) {
    // Logo Container
    const logo = document.createElement('img');
    logo.src = data[locationType][0].imagePath; // Assuming the first item represents the location logo
    logo.alt = `${data[locationType][0].name} Flag`;
    modal.querySelector('#logo-container').appendChild(logo);

    // Hero Carousel
    data[locationType].forEach(item => {
      const img = document.createElement('img');
      img.src = item.imagePath;
      img.alt = item.name;
      modal.querySelector('#hero-carousel').appendChild(img);
    });

    // Community Flag and Description
    const communityFlag = document.createElement('img');
    communityFlag.src = data[locationType][0].imagePath; // Same as logo for simplicity
    communityFlag.alt = `${data[locationType][0].name} Flag`;
    modal.querySelector('#community-flag').appendChild(communityFlag);

    const communityDescription = document.createElement('p');
    communityDescription.textContent = `Welcome to ${data[locationType][0].name}. Here you can explore more about this region.`;
    modal.querySelector('#community-hero-description').appendChild(communityDescription);

    // Timeline Section (Sample Data)
    const timeline = ['Event 1: Date', 'Event 2: Date', 'Event 3: Date'];
    timeline.forEach(event => {
      const eventItem = document.createElement('div');
      eventItem.textContent = event;
      modal.querySelector('#timeline-container').appendChild(eventItem);
    });

    // Announcements (Sample Data)
    const announcements = ['Announcement 1', 'Announcement 2', 'Announcement 3'];
    announcements.forEach(announcement => {
      const announcementItem = document.createElement('div');
      announcementItem.textContent = announcement;
      modal.querySelector('#announcement-list').appendChild(announcementItem);
    });

    // Achievements Section (Sample Data)
    const achievements = ['Achievement 1', 'Achievement 2', 'Achievement 3'];
    achievements.forEach(achievement => {
      const achievementItem = document.createElement('div');
      achievementItem.textContent = achievement;
      modal.querySelector('#achievements-content').appendChild(achievementItem);
    });

    // Charts Section (Sample Data)
    const chartData = ['Chart 1', 'Chart 2', 'Chart 3'];
    chartData.forEach(chart => {
      const chartItem = document.createElement('div');
      chartItem.textContent = chart;
      modal.querySelector('#stats-charts-container').appendChild(chartItem);
    });

    // News Section (Sample Data)
    const newsItems = ['News 1', 'News 2', 'News 3'];
    newsItems.forEach(news => {
      const newsItem = document.createElement('div');
      newsItem.textContent = news;
      modal.querySelector('#news-list').appendChild(newsItem);
    });

    // Show the modal
    modal.style.display = 'block';
  }
}

// Close modal
document.querySelector('#close-modal').addEventListener('click', function() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
});

// Close modal if user clicks outside of it
window.addEventListener('click', function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});
