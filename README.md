# San Antero Condo Rentals

A beautiful website showcasing luxury condo rentals in San Antero, Colombia. Built with HTML, CSS, and JavaScript.

## Development & roadmap

- Product vision: [`docs/PRODUCT.md`](docs/PRODUCT.md) · Work queue: [`docs/BACKLOG.md`](docs/BACKLOG.md) · PRDs: [`docs/prds/`](docs/prds/)
- Preview locally: `bash scripts/serve.sh` → http://localhost:8080/ and `/en/`
- Quality gate (run before every commit): `node scripts/verify.mjs`
- Agent workflow: see [`CLAUDE.md`](CLAUDE.md); slash commands `/prd-next`, `/prd-verify`, `/prd-status`

> Note: the "Project Structure" and S3 sections below are outdated; correcting them is tracked in [PRD-008](docs/prds/PRD-008-content-trust.md).

## Features
- Responsive design
- Bilingual support (English/Spanish)
- Beautiful Caribbean-themed UI
- Image gallery
- Interactive elements

## Visit the Website
Visit [https://juanelopezm.github.io/san-antero-condo/](https://juanelopezm.github.io/san-antero-condo/) to view the live site.

## Project Structure
```
san-antero-condo/
├── src/
│   ├── css/
│   │   └── styles.css        # Styles for the web page
│   ├── js/
│   │   └── scripts.js        # JavaScript for interactive features
│   ├── images/                # Directory for apartment images
│   └── index.html            # Main HTML file
├── .gitignore                # Files to ignore in version control
└── README.md                 # Project documentation
```

## Getting Started

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   ```

2. **Navigate to the project directory**:
   ```
   cd san-antero-condo
   ```

3. **Open the `index.html` file** in your web browser to view the project.

## Deployment

To deploy the static web page to Amazon S3:

1. **Create an S3 bucket** in the AWS Management Console.
2. **Upload the contents** of the `src` directory to the S3 bucket.
3. **Configure the bucket** for static website hosting.
4. **Set the permissions** to allow public access to the files.

## Usage

The web page provides information about rental apartments, including:

- Apartment features
- Pricing
- Availability
- Images of the condo and surrounding area

Feel free to customize the content and styles to suit your needs!

## License

This project is open-source and available under the MIT License.
